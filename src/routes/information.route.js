import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getAllBanner,
  getAllService,
} from "../controllers/information.controller.js";

const informationRoute = express.Router();

informationRoute.get("/banner", [authMiddleware], getAllBanner);
informationRoute.get("/services", [authMiddleware], getAllService);

export default informationRoute;
