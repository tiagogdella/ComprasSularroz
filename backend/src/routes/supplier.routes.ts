import { Router } from "express";
import * as supplierController from "../controllers/supplier.controller.js";

export const supplierRouter = Router();

supplierRouter.get("/", supplierController.list);
supplierRouter.get("/:id", supplierController.getById);
supplierRouter.post("/", supplierController.create);
supplierRouter.put("/:id", supplierController.update);
supplierRouter.delete("/:id", supplierController.remove);

