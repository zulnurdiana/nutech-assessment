import jwt from "jsonwebtoken";
import { JWT_SECRET_REFRESH } from "../secret.js";
import db from "../utils/db.js";
import { response } from "../utils/response.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return response(res, 401, 108, "Token tidak valid atau kadaluwarsa", null);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET_REFRESH);

    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      payload.email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};
