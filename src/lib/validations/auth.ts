import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export const registerSchema = z
  .object({
    displayName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 digit"),
    confirmPassword: z.string(),
    gender: z.enum(["MALE", "FEMALE"]).nullable().optional(),
    nationality: z.string().nullable().optional(),
    budgetLevel: z.enum(["budget", "mid", "luxury"]).nullable().optional(),
    travelStyle: z
      .enum(["cultural", "adventure", "relaxation", "family", "solo", "romantic"])
      .nullable()
      .optional(),
    interests: z.array(z.string()).nullable().optional(),
    accommodationType: z
      .enum(["hotel", "hostel", "resort", "apartment"])
      .nullable()
      .optional(),
    arrivalDate: z.string().nullable().optional(),
    departureDate: z.string().nullable().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 digit"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
