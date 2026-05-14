import { z } from 'zod';
import { UserRole } from '@nextgenoutreach/types';

export const registerSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
                      .regex(/[A-Z]/, 'Must contain uppercase')
                      .regex(/[0-9]/, 'Must contain a number'),
  role:     z.enum(['client', 'rep']),
  name:     z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().length(6).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
                      .regex(/[A-Z]/, 'Must contain uppercase')
                      .regex(/[0-9]/, 'Must contain a number'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'Password must be at least 8 characters')
                          .regex(/[A-Z]/, 'Must contain uppercase')
                          .regex(/[0-9]/, 'Must contain a number'),
});

export const setup2FASchema = z.object({
  secret: z.string().min(1, '2FA secret is required'),
  token:   z.string().length(6, 'Invalid 2FA token'),
});

export const verify2FASchema = z.object({
  token: z.string().length(6, 'Invalid 2FA token'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type Setup2FAInput = z.infer<typeof setup2FASchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
