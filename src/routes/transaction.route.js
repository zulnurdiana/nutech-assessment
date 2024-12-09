import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  balance,
  getTransactionHistory,
  topup,
  transaction,
} from "../controllers/transaction.controller.js";

const transactionRoute = express.Router();

transactionRoute.get("/balance", [authMiddleware], balance);
transactionRoute.post("/topup", [authMiddleware], topup);
transactionRoute.post("/", [authMiddleware], transaction);
transactionRoute.get("/history", [authMiddleware], getTransactionHistory);

export default transactionRoute;
