import { Router } from "express";
import * as supplierController from "../controllers/supplier.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export const supplierRouter = Router();

supplierRouter.get("/", supplierController.list);
supplierRouter.get("/:id", supplierController.getById);
supplierRouter.post("/", authenticate, supplierController.create);
supplierRouter.put("/:id", authenticate,  supplierController.update);
supplierRouter.delete("/:id", authenticate, supplierController.remove);

