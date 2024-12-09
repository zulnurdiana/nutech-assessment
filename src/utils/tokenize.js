import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRES,
  JWT_SECRET_ACCESS,
  JWT_SECRET_REFRESH,
  REFRESH_TOKEN_EXPIRES,
} from "../secret.js";

export const refreshTokenGenerate = (user) => {
  const refresh_token = jwt.sign({ email: user.email }, JWT_SECRET_REFRESH, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });

  return refresh_token;
};

export const accessTokenGenerate = (user) => {
  const access_token = jwt.sign({ email: user.email }, JWT_SECRET_ACCESS, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });

  return access_token;
};
