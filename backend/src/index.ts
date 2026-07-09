import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) =>{
    res.json({status: "ok"});
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});