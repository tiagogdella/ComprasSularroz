import { Router } from "express";
import * as aiController from "../controllers/ai.controller.ts";
import { authenticate } from "../middlewares/authenticate.ts";

export const aiRouter = Router();

aiRouter.post("/suggest-category", authenticate, aiController.suggestCategory);
aiRouter.post("/price-report", authenticate, aiController.priceReport);