import ProductHistoryView from "../../views/ProductHistoryView.vue";
import { http } from "./http";

export function suggestCategory(description: string) {
    return http
    .post<{ caregory: string }>("/ai/suggest-category", { description })
    .then((res) => res.data.category);
}

export interface PriceReport {
    verdict: "low" | "normal" | "high";
    text: string;
    historyPrices: number[];
    marketPrices: number[];
}

export function fetchPriceReport(description: string, paidPrice: number, productId?: number) {
    return http
        .post<PriceReport>("/ai/price-report", { description, paidPrice, productId })
        .then((res) => res.data);
}