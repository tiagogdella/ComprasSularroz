import { Router } from "express";
import * as statsController from "../controllers/stats.controller.js";

export const statsRouter = Router();

statsRouter.get("/by-period", statsController.byPeriod);
statsRouter.get("/by-category", statsController.byCategory);
statsRouter.get("/by-supplier", statsController.bySupplier);