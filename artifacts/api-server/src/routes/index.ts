import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import sourcesRouter from "./sources";
import accountRouter from "./account";
import maintenanceRouter from "./maintenance";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/cases", casesRouter);
router.use("/sources", sourcesRouter);
router.use("/account", accountRouter);
router.use("/internal/maintenance", maintenanceRouter);

export default router;
