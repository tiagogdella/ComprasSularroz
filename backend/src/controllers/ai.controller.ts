import type { Request, Response } from "express";
import { suggestCategorySchema, priceReportSchema } from "../schemas/ai.schema.js";
import * as aiService from "../services/ai.service.ts";
import * as productService from "../services/product.service.ts";
import { searchCheapestPrices } from "../services/mercadolivre.service.ts";

export async function suggestCategory(req: Request, res: Response) {
    const parsed = suggestCategorySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
    }

    try {
        const category = await aiService.suggestCategory(parsed.data.description);
        res.json({ category });
    } catch (error) {
        console.error("AI category suggestion failed:", error);
        res.json({ category: "Não classificado" });
    }
}

export async function priceReport(req: Request, res: Response) {
    const parsed = priceReportSchema.safeParse(req.body);
    if(!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
    }

    const { productId, description, paidPrice } = parsed.data;

    const historyPrices = productId
        ? await productService.getRecentUnitPrices(productId)
        : [];
    
    let marketPrices: number[] = [];
    try {
        const results = await searchCheapestPrices(description);
        marketPrices = results.map((r) => r.price);
    } catch (error) {
        console.error("Mercado livre search failed:", error);
    }

    try {
        const report = await aiService.generatePriceReport(description, paidPrice, historyPrices, marketPrices);
        res.json({ ...report, historyPrices, marketPrices });
    } catch (error) {
        console.error("AI price report failed:", error);
        res.json({ verdict: "normal", text: "", historyPrices, marketPrices });
    }
}