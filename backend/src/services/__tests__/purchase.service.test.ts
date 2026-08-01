jest.mock("../../lib/prisma.js", () => ({ prisma: {} }));

import { buildPurchaseItems } from "../purchase.service.js";

describe("buildPurchaseItems", () => {
    it("calcula totalPrice de cada item e o totalAmount da compra", () => {
        const result = buildPurchaseItems([
            { productId: 1, quantity: 2, unitPrice: 10.5 },
            { productId: 2, quantity: 3, unitPrice: 5 },
        ]);

        expect(result.items[0].totalPrice).toBe(21);
        expect(result.items[1].totalPrice).toBe(15);
        expect(result.totalAmount).toBe(36);
    });

    it("arredonda pra 2 casas decimais mesmo com dízima", () => {
        const result = buildPurchaseItems([
            { productId: 1, quantity: 3, unitPrice: 0.1 },
        ]);

        expect(result.items[0].totalPrice).toBe(0.3);
        expect(result.totalAmount).toBe(0.3);
    });

    it("ignora qualquer totalAmount que venha de fora — sempre recalcula a partir dos itens", () => {
        const result = buildPurchaseItems([
            { productId: 1, quantity: 1, unitPrice: 100 },
        ]);

        expect(result.totalAmount).toBe(100);
    });
});
