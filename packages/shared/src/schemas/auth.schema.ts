import z from "zod";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(64, "Password must be under 64 characters");
const phoneRule = z
  .string()
  .regex(
    /^(09|\+639)\d{9}$/,
    "Phone must be a valid PH number (e.g., 09171234567 or +639171234567)",
  );
const nameRule = (field: string) =>
  z
    .string()
    .min(2, `${field} must be at least 2 characters`)
    .max(50, `${field} must be under 50 characters`)
    .trim();

// ------ Register here ----------

export const RegisterSchema = z.object({
  firstName: nameRule("First name"),
  lastName: nameRule("Last name"),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  phone: phoneRule,
  password: passwordRule,
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// ------- Login naman dito --------

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: passwordRule,
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ------- Changed password ---------

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ["confirmPassword"],
  });

  export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;    
