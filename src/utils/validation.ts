import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3), // على الأقل 3 حروف للـ username
  password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
});

export const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  nationalId: z.string().min(10),
  birthDate: z.date(),
  password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;