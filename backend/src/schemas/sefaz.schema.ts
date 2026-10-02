import { z } from "zod";

export const accessKeyParamSchema = z.object({
  accessKey: z.string().regex(/^\d{44}$/, "Chave de acesso deve ter 44 dígitos"),
});

// NFS-e (Nota Fiscal de Serviço, padrão nacional) usa chave de 50 dígitos, diferente da
// NF-e/CT-e - ver API_Sefaz_CCD/docs/protocolo-nfse-sefaz.md
export const nfseAccessKeyParamSchema = z.object({
  accessKey: z.string().regex(/^\d{50}$/, "Chave de acesso de NFS-e deve ter 50 dígitos"),
});
