import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Judul tidak boleh kosong")
    .max(200, "Judul maksimal 200 karakter"),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().min(1, "Assignee harus dipilih"),
  deadline: z
    .string()
    .datetime({ message: "Format tanggal tidak valid (gunakan ISO 8601)" })
    .optional()
    .nullable(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().min(1).optional(),
  deadline: z
    .string()
    .datetime()
    .optional()
    .nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]).optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
