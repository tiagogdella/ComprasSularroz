import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export const productRouter = Router();

productRouter.get("/", productController.list);
productRouter.get("/:id", productController.getById);
productRouter.post("/", authenticate, productController.create);
productRouter.put("/:id", authenticate, productController.update);
productRouter.delete("/:id", authenticate, productController.remove);