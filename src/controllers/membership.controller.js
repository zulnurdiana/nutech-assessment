import db from "../utils/db.js";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import {
  authLoginSchema,
  authRegisterSchema,
} from "../model/membership.model.js";
import { response } from "../utils/response.js";
import { refreshTokenGenerate } from "../utils/tokenize.js";

export const register = async (req, res) => {
  try {
    const validation = authRegisterSchema.parse(req.body);
    const hashPassword = await bcrypt.hash(validation.password, 10);

    const result = await db.query(
      "INSERT INTO users (email,first_name, last_name, password) VALUES ($1, $2, $3, $4) RETURNING id",
      [
        validation.email,
        validation.first_name,
        validation.last_name,
        hashPassword,
      ]
    );

    if (result) {
      response(
        res,
        200,
        0,
        "Registrasi Berhasil Dilakukan Silahkan Login",
        null
      );
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const emailError = error.issues.some((issue) =>
        issue.path.includes("email")
      );

      if (emailError) {
        response(res, 400, 102, "Parameter email tidak sesuai format", null);
      }
    }

    res.status(500).json({ message: "Error registering user", error });
  }
};

export const login = async (req, res) => {
  try {
    const validation = authLoginSchema.parse(req.body);

    const result = await db.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [validation.email]
    );

    if (result.rows.length === 0) {
      return response(res, 401, 103, "Email atau password salah", null);
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(
      validation.password,
      user.password
    );

    if (!isPasswordValid) {
      return response(res, 401, 103, "Email atau password salah", null);
    }

    const refresh_token = refreshTokenGenerate(user);

    return response(res, 200, 0, "Login Berhasil", { token: refresh_token });
  } catch (error) {
    if (error instanceof ZodError) {
      const emailError = error.issues.some((issue) =>
        issue.path.includes("email")
      );

      if (emailError) {
        return response(
          res,
          400,
          102,
          "Parameter email tidak sesuai format",
          null
        );
      }
    }

    console.error("Login Error:", error);
    return res.status(500).json({
      status: 104,
      message: "Terjadi kesalahan saat login",
      error: error.message,
    });
  }
};

export const profile = async (req, res) => {
  const user = req.user;
  response(res, 200, 0, "Sukses", { user });
};

export const profileUpdate = async (req, res) => {
  try {
    const user = req.user;
    const { first_name, last_name } = req.body;
    let result = null;

    if (first_name) {
      result = await db.query(
        `UPDATE users 
       SET first_name = $1
       WHERE email = $2 
       RETURNING *`,
        [first_name, user.email]
      );
    }

    if (last_name) {
      result = await db.query(
        `UPDATE users 
       SET last_name = $1
       WHERE email = $2 
       RETURNING *`,
        [last_name, user.email]
      );
    }

    const updatedUser = result.rows[0];

    response(res, 200, 0, "Update Profile berhasil", {
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const profileImage = async (req, res) => {
  try {
    const user = req.user;

    const profileImageUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    console.log(profileImageUrl);

    console.log(req.file.filename);

    const result = await db.query(
      `UPDATE users 
       SET profile_image = $1 
       WHERE email = $2 
       RETURNING email, first_name, last_name, profile_image`,
      [profileImageUrl, user.email]
    );

    const updatedUser = result.rows[0];

    if (result) {
      response(res, 200, 0, "Update Profile Image berhasil", {
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        profile_image: updatedUser.profile_image,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating profile imagez", error });
  }
};
