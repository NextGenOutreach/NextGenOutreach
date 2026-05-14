"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  getIdTokenResult,
} from "firebase/auth";
import { auth } from "./firebase";

type UserRole = "client" | "rep" | "admin" | "super_admin";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (email: string, password: string, role: UserRole, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function resolveUserRole(firebaseUser: User, registrationRole?: UserRole): Promise<UserRole> {
  if (!API_URL) return registrationRole ?? "client";
  
  try {
    const tokenResult = await getIdTokenResult(firebaseUser);
    if (tokenResult.claims.role) {
      return tokenResult.claims.role as UserRole;
    }

    const idToken = tokenResult.token;
    const response = await fetch(`${API_URL}/api/v1/auth/sync-claims`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: registrationRole }),
    });

    if (response.ok) {
      const data = await response.json();
      await getIdTokenResult(firebaseUser, true);
      return (data.data?.role as UserRole) ?? "client";
    }
  } catch (error) {
    console.warn("Backend claims sync failed, using default role:", error);
  }

  return registrationRole ?? "client";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const role = await resolveUserRole(firebaseUser);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthUser> => {
    if (!auth) throw new Error("Firebase not initialized");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const role = await resolveUserRole(cred.user);
    const authUser: AuthUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      role,
    };
    setUser(authUser);
    return authUser;
  };

  const signUp = async (email: string, password: string, role: UserRole, displayName?: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    const assignedRole = await resolveUserRole(cred.user, role);
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName ?? displayName ?? null,
      role: assignedRole,
    });
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
