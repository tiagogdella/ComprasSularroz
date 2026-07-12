import type { Request, Response } from "express";
import { createSupplierSchema, updateSupplierSchema } from "../schemas/supplier.schema.js";
import * as supplierService from "../services/supplier.service.js";

export async function list(_req: Request, res: Response) {
    const suppliers = await supplierService.listSuppliers();
    res.json(suppliers);
}

export async function getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const supplier = await supplierService.getSupplierById(id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
}

export async function create(req: Request, res: Response) {
    const parsed = createSupplierSchema.safeParse(req.body);
    if(!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const supplier = await supplierService.createSupplier(parsed.data);
    res.status(201).json(supplier)
}

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const parsed = updateSupplierSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const supplier = await supplierService.updateSupplier(id, parsed.data);
    res.json(supplier);
}

export async function remove(req: Request, res: Response){
    const id = Number(req.params.id);
    await supplierService.deleteSupplier(id);
    res.status(204).send()
}