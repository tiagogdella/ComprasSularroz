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

export interface NfeItem {
    code: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
}

export interface NfeData {
    accessKey: string;
    invoiceNumber: number;
    supplierCnpj: string;
    supplierName: string;
    issueDate: string;
    totalAmount: number;
    items: NfeItem[];
}

export async function fetchNfeData(accessKey: string): Promise<NfeData> {
    const response = await fetch(`${SEFAZ_API_URL}/consultas/nfe`, {
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

    const data = await response.json();
    return {
        accessKey: data.access_key,
        invoiceNumber: data.invoice_number,
        supplierCnpj: data.supplier_cnpj,
        supplierName: data.supplier_name,
        issueDate: data.issue_date,
        totalAmount: data.total_amount,
        items: data.items.map((item: any) => ({
            code: item.code,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unit_price,
            totalPrice: item.total_price,
        })),
    };
}

