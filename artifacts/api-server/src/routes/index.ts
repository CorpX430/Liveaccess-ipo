import { Router, type IRouter } from "express";
import healthRouter from "./health";
import investorsRouter from "./investors";
import authRouter from "./auth";
import stockRouter from "./stock";
import depositsRouter from "./deposits";
import holdingsRouter from "./holdings";
import adminRouter from "./admin";
import newsRouter from "./news";

const router: IRouter = Router();

router.use(healthRouter);
router.use(investorsRouter);
router.use(authRouter);
router.use(stockRouter);
router.use(depositsRouter);
router.use(holdingsRouter);
router.use(adminRouter);
router.use(newsRouter);

export default router;
