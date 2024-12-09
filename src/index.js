import express from "express";
import router from "./routes/index.js";
import { PORT } from "./secret.js";
import path from "path";

const app = express();

app.use(express.json());
app.use("/api", router);

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
