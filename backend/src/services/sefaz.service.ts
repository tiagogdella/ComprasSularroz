import { AppError } from "../errors/AppError.js";

const SEFAZ_API_URL = process.env.SEFAZ_API_URL ?? "http://localhost:8000";
const SEFAZ_API_KEY = process.env.SEFAZ_API_KEY as string;

export async function fetchNfeXml(accessKey: string): Promise<string> {
    const response = await fetch(`${SEFAZ_API_URL}/consultas/xml`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": SEFAZ_API_KEY,
        },
        body: JSON.stringify({ accessKey }),
    });

    if (response.status === 404) {
        throw new AppError(404, "Nota fiscal não encontrada");
    }
    if (response.status === 429) {
        const body = await response.json();
        throw new AppError(429, body.detail ?? "Aguarde antes de tentar novamente");
    }
    if (!response.ok) {
        throw new AppError(502, "Erro ao consultar a SEFAZ");
    }

    return response.text();
}
