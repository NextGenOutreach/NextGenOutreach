"use server";

import { redirect } from "next/navigation";

export type ContactFormState = {
  error?: string | null;
  success?: boolean;
  fields?: {
    fullName: string;
    email: string;
    contactType: string;
    message: string;
  };
};

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const fields = {
    fullName: String(formData.get("fullName") || ""),
    email: String(formData.get("email") || ""),
    contactType: String(formData.get("contactType") || ""),
    message: String(formData.get("message") || ""),
  };

  if (!fields.fullName || !fields.email || !fields.contactType || !fields.message) {
    return { error: "missing-fields", fields };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(fields.email)) {
    return { error: "invalid-email", fields };
  }

  // TODO: Wire to email service (SendGrid, Resend, etc.)
  redirect("/contact/success");
}
