import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { errorMiddleware } from "./middlewares/error";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "OK" });
});

import router from "./routes/router";

app.use("/api", router);
app.use(errorMiddleware);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Master Cars API listening on port ${port}`);
});
