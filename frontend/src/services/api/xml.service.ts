import { http } from "./http";

export function fetchXmlBlob(accessKey: string) {
    return http.get(`/sefaz/xml/${accessKey}`, { responseType: "blob" }).then((res) => res.data as Blob);
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
    invoiceNumber: string;
    supplierCnpj: string;
    supplierName: string;
    issueDate: string;
    totalAmount: number;
    items: NfeItem[];
}

export function fetchNfeData(accessKey: string) {
    return http.get<NfeData>(`/sefaz/nfe/${accessKey}`).then((res) => res.data);
}
