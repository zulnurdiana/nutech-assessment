import express from "express";
import {
  login,
  profile,
  profileImage,
  profileUpdate,
  register,
} from "../controllers/membership.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../utils/storage.js";

const membershipRouter = express.Router();

membershipRouter.post("/register", register);
membershipRouter.post("/login", login);
membershipRouter.get("/profile", [authMiddleware], profile);
membershipRouter.put("/profile/update", [authMiddleware], profileUpdate);
membershipRouter.put(
  "/profile/image",
  [authMiddleware],
  upload.single("file"),
  profileImage
);

export default membershipRouter;
