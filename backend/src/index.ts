import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { supplierRouter } from "./routes/supplier.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { purchaseRouter } from "./routes/purchase.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/suppliers", supplierRouter);
app.use("/products", productRouter);
app.use("/purchases", purchaseRouter);


app.get("/health", (_req, res) =>{
    res.json({status: "ok"});
});

app.use((req, res) => {
    res.status(404).json({ message: "Router not found" });
})

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});