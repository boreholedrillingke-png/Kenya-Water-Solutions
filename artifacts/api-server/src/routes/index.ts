import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import productsRouter from "./products";
import cartRouter from "./cart";
import inquiriesRouter from "./inquiries";
import catalogRouter from "./catalog";

const router: IRouter = Router();

router.use(healthRouter);
router.use(servicesRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(inquiriesRouter);
router.use(catalogRouter);

export default router;
