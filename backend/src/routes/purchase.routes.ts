import { Router } from "express";
import * as purchaseController from "../controllers/purchase.controller.js";

export const purchaseRouter = Router();

purchaseRouter.post("/", purchaseController.create);