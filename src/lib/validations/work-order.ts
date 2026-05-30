import { z } from "zod";

export const CreateWorkOrderSchema = z.object({
  title: z
    .string()
    .min(1, "Judul tidak boleh kosong")
    .max(200, "Judul maksimal 200 karakter"),
  description: z.string().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  deadline: z
    .string()
    .datetime({ message: "Format tanggal tidak valid (gunakan ISO 8601)" })
    .optional()
    .nullable(),
});

export const UpdateWorkOrderSchema = CreateWorkOrderSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Minimal satu field harus diisi" }
);

export type CreateWorkOrderInput = z.infer<typeof CreateWorkOrderSchema>;
export type UpdateWorkOrderInput = z.infer<typeof UpdateWorkOrderSchema>;
