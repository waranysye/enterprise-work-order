import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid").max(254),
  password: z.string().min(1, "Password tidak boleh kosong").max(128),
});

export type LoginInput = z.infer<typeof LoginSchema>;
