import { http } from "./http";

export interface Supplier {
    id: number;
    name: string;
    taxId: string;
    contact: string | null;
}

export interface CreateSupplierInput {
    name: string;
    taxId: string;
    contact?: string;
}

export function listSuppliers() {
    return http.get<Supplier[]>("/suppliers").then((res) => res.data);
}

export function createSupplier(data: CreateSupplierInput) {
    return http.post<Supplier>("/suppliers", data).then((res) => res.data);
}