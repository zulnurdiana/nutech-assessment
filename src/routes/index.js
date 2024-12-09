import express from "express";
import membershipRouter from "./membership.route.js";
import informationRoute from "./information.route.js";
import transactionRoute from "./transaction.route.js";

const router = express.Router();

router.use("/user", membershipRouter);
router.use("/information", informationRoute);
router.use("/transaction", transactionRoute);

export default router;
