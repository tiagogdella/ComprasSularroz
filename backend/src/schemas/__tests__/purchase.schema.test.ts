import { createPurchaseSchema } from "../purchase.schema.js";

const validPayload = {
    invoiceNumber: "12345",
    issueDate: "2026-08-01",
    entryMethod: "MANUAL",
    supplierId: 1,
    userId: 1,
    items: [{ productId: 1, quantity: 2, unitPrice: 10 }],
};

describe("createPurchaseSchema", () => {
    it("aceita um payload válido completo", () => {
        const result = createPurchaseSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it("rejeita compra sem nenhum item", () => {
        const result = createPurchaseSchema.safeParse({ ...validPayload, items: [] });
        expect(result.success).toBe(false);
    });

    it("rejeita item com quantidade zero ou negativa", () => {
        const result = createPurchaseSchema.safeParse({
            ...validPayload,
            items: [{ productId: 1, quantity: 0, unitPrice: 10 }],
        });
        expect(result.success).toBe(false);
    });

    it("rejeita item com valor unitário negativo", () => {
        const result = createPurchaseSchema.safeParse({
            ...validPayload,
            items: [{ productId: 1, quantity: 1, unitPrice: -5 }],
        });
        expect(result.success).toBe(false);
    });

    it("rejeita chave de acesso com tamanho diferente de 44", () => {
        const result = createPurchaseSchema.safeParse({ ...validPayload, accessKey: "123" });
        expect(result.success).toBe(false);
    });

    it("rejeita forma de lançamento fora do enum (MANUAL/SCANNED)", () => {
        const result = createPurchaseSchema.safeParse({ ...validPayload, entryMethod: "FOO" });
        expect(result.success).toBe(false);
    });

    it("rejeita nota sem número da nota fiscal", () => {
        const result = createPurchaseSchema.safeParse({ ...validPayload, invoiceNumber: "" });
        expect(result.success).toBe(false);
    });
});
