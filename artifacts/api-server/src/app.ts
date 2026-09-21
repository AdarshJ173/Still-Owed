import express, { type Express } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.raw({ type: ["image/*", "application/octet-stream"], limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use("/api", router);

// Serve frontend client in production
const possibleDistPaths = [
  path.resolve(process.cwd(), "artifacts/still-owed/dist/public"),
  path.resolve(__dirname, "../../still-owed/dist/public"),
  path.resolve(__dirname, "../still-owed/dist/public"),
];
const frontendDist = possibleDistPaths.find((p) => fs.existsSync(p));

if (frontendDist) {
  logger.info({ path: frontendDist }, "Serving static frontend assets");
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(frontendDist, "index.html"));
    }
    next();
  });
}

export default app;
