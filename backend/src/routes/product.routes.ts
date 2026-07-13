import { Router } from "express";
import * as productController from "../controllers/product.controller.js";

export const productRouter = Router();

productRouter.get("/", productController.list);
productRouter.get("/:id", productController.getById);
productRouter.post("/", productController.create);
productRouter.put("/:id", productController.update);
productRouter.delete("/:id", productController.remove);