import { http } from "./http";

export interface SpendingByPeriod {
    month: number;
    total: number;
}

export interface SpendingByCategory {
    category: string;
    total: number;
}

export interface SpendingBySupplier {
    supplierId: number;
    supplierName: string;
    total: number;
}

export function getSpendingByPeriod(year: number) {
    return http.get<SpendingByPeriod[]>("/stats/by-period", { params: { year } }).then((res) => res.data);
}

export function getSpendingByCategory(params?: { startDate?: string; endDate?: string }) {
    return http.get<SpendingByCategory[]>("/stats/by-category", { params }).then((res) => res.data);
}

export function getSpendingBySupplier(params?: { startDate?: string; endDate?: string }) {
    return http.get<SpendingBySupplier[]>("/stats/by-supplier", { params }).then((res) => res.data);
}
