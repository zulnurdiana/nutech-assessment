import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const HOST = process.env.DB_HOST;
export const USER = process.env.DB_USER;
export const PASSWORD = process.env.DB_PASSWORD;
export const DATABASE = process.env.DB_NAME;
export const DB_PORT = process.env.DB_PORT;
export const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH;
export const JWT_SECRET_ACCESS = process.env.JWT_SECRET_ACCESS;
export const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES;
export const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;
