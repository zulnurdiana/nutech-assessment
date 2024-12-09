import multer from "multer";
import fs, { mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "../../");
const uploadDir = path.join(rootDir, "uploads");

if (!fs.existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file || !file.originalname) {
      return cb(
        new Error(
          "Error: Tidak ada file yang diberikan atau file tidak memiliki nama!"
        )
      );
    }

    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: Unggah file hanya mendukung gambar JPEG dan PNG!"));
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
