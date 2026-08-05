import { z } from "zod";

export const accessKeyParamSchema = z.object({
  accessKey: z.string().regex(/^\d{44}$/, "Chave de acesso deve ter 44 dígitos"),
});
