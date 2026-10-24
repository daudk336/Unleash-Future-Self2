import { Router, type IRouter } from "express";
import accountRouter from "./account";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(accountRouter);
router.use(healthRouter);

export default router;
