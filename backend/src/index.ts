import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { supplierRouter } from "./routes/supplier.routes.js";

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/suppliers", supplierRouter);

app.get("/health", (_req, res) =>{
    res.json({status: "ok"});
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});