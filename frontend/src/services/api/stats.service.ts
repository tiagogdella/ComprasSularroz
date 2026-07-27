import { http } from "./http";

export interface SpendingByPeriod {
    month: number;
    total: number;
}

export function getSpendingByPeriod(year: number) {
    return http.get<SpendingByPeriod[]>("/stats/by-period", { params: { year } }).then((res) => res.data);
}
