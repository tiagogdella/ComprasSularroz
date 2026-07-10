import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { prisma } from "../src/lib/prisma.js";
import { access } from "node:fs";

async function main() {
    // clean the db before it seeds to not duplicate
    await prisma.purchaseItem.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.user.deleteMany();


    const [supplierA, supplierB, , ] = await Promise.all([
        prisma.supplier.create({ data: { name: "Ferragens Sul Ltda", taxId: "11111111000101", contact: "João Silva - (48) 99999-0001" } }),
        prisma.supplier.create({ data: { name: "Distribuidora Lubrifica", taxId: "22222222000102", contact: "Maria Souza - (48) 99999-0002" } }),
        prisma.supplier.create({ data: { name: "Elétrica Santa Catarina", taxId: "33333333000103", contact: "Pedro Lima - (48) 99999-0003" } }),
        prisma.supplier.create({ data: { name: "Rolamentos & Cia", taxId: "44444444000104", contact: "Ana Costa - (48) 99999-0004" } }),
    ]);

    const products = await Promise.all([
        prisma.product.create({ data: { name: "Óleo lubrificante 20W50", category: "Lubrificantes", unit: "litro", specification: "Mineral, uso geral em máquinas" } }),
        prisma.product.create({ data: { name: "Graxa industrial", category: "Lubrificantes", unit: "quilo", specification: "Graxa de lítio, uso geral" } }),
        prisma.product.create({ data: { name: "Correia dentada", category: "Transmissão", unit: "unidade", specification: "Modelo XPZ 1250" } }),
        prisma.product.create({ data: { name: "Rolamento esférico", category: "Transmissão", unit: "unidade", specification: "Rolamento 6205-2RS" } }),
        prisma.product.create({ data: { name: "Filtro de ar", category: "Filtragem", unit: "unidade", specification: "Compatível com compressor 10HP" } }),
        prisma.product.create({ data: { name: "Filtro de óleo", category: "Filtragem", unit: "unidade", specification: "Rosca 3/4 polegada" } }),
        prisma.product.create({ data: { name: "Disjuntor bipolar 32A", category: "Elétrica", unit: "unidade", specification: "Curva C, padrão DIN" } }),
        prisma.product.create({ data: { name: "Cabo flexível 2,5mm", category: "Elétrica", unit: "metro", specification: "750V, cor preta" } }),
        prisma.product.create({ data: { name: "Lâmpada LED 20W", category: "Elétrica", unit: "unidade", specification: "Base E27, luz branca fria" } }),
        prisma.product.create({ data: { name: "Parafuso sextavado M8", category: "Fixação", unit: "unidade", specification: "Aço inox, 30mm" } }),
        prisma.product.create({ data: { name: "Vedante de silicone", category: "Vedação", unit: "unidade", specification: "Tubo 280ml, uso industrial" } }),
        prisma.product.create({ data: { name: "Luva de proteção", category: "EPI", unit: "par", specification: "Vaqueta, tamanho G" } }),
    ]);

    const admin = await prisma.user.create({ data: { name: "Administrador", login: "admin" } });

    await prisma.purchase.create({
        data: {
            invoiceNumber: "000123",
            issueDate: new Date("2026-06-02"),
            totalAmount: 350.0,
            entryMethod: "MANUAL",
            supplierId: supplierA.id,
            userId: admin.id,
            items: {
                create: [
                    { productId: products[0].id, quantity: 5, unitPrice: 40.0, totalPrice: 200.0 },
                    { productId: products[2].id, quantity: 1, unitPrice: 150.0, totalPrice: 150.0 },
                ],
            },
        },
    });

    await prisma.purchase.create({
        data: {
            accessKey: "42260611222333000181550010000001231123456789",
            invoiceNumber: "000124",
            issueDate: new Date("2026-06-15"),
            totalAmount: 95.5,
            entryMethod: "SCANNED",
            supplierId: supplierB.id,
            userId: admin.id,
            items: {
                create: [
                    { productId: products[4].id, quantity: 1, unitPrice: 65.5, totalPrice: 65.5 },
                    { productId: products[5].id, quantity: 1, unitPrice: 30.0, totalPrice: 30.0 },
                ],
            },
        },
    });
}

main() 
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });