import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email("Format email tidak valid").max(254),
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  password: z.string().min(8, "Password minimal 8 karakter").max(128),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const UpdateUserSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(2).max(100).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi",
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
