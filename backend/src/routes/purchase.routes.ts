import { Router } from "express";
import * as purchaseController from "../controllers/purchase.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export const purchaseRouter = Router();

purchaseRouter.post("/", authenticate, purchaseController.create);
purchaseRouter.get("/", purchaseController.list);
purchaseRouter.get("/:id", purchaseController.getById);
purchaseRouter.put("/:id", authenticate, purchaseController.update);
purchaseRouter.delete("/:id", authenticate, purchaseController.remove);