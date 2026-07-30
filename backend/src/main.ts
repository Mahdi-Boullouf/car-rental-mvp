import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { errorMiddleware } from "./middlewares/error";

const app = express();

// A browser's Origin header never carries a trailing slash, but a URL pasted into
// a dashboard env var usually does — cors() compares them as strings and rejects
// the match. Normalize, and accept a comma-separated list for multiple frontends.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "OK" });
});

import router from "./routes/router";

const BASE = process.env.API_BASE_PATH ?? "";
app.use(`${BASE}/api`, router);
app.use(errorMiddleware);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Master Cars API listening on port ${port}`);
});
