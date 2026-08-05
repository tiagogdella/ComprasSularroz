import { Router } from "express";
import * as sefazController from "../controllers/sefaz.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export const sefazRouter = Router();

sefazRouter.get("/xml/:accessKey", authenticate, sefazController.getXml);
sefazRouter.get("/nfe/:accessKey", authenticate, sefazController.getNfeData);