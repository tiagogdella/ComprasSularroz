import type { Request, Response } from "express";
import { accessKeyParamSchema } from "../schemas/sefaz.schema.js";
import * as sefazService from "../services/sefaz.service.js";

export async function getXml(req: Request, res: Response) {
    const parsed = accessKeyParamSchema.safeParse(req.params);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
    }

    const xml = await sefazService.fetchNfeXml(parsed.data.accessKey);

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Content-Disposition", `attachment; filename="${parsed.data.accessKey}.xml"`);
    res.send(xml);
}

export async function getNfeData(req: Request, res: Response) {
    const parsed = accessKeyParamSchema.safeParse(req.params);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
    }

    const data = await sefazService.fetchNfeData(parsed.data.accessKey);
    res.json(data);
}
