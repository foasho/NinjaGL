import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { SkywayTokenApi, NpcApi } from "@ninjagl/api";

// 許可するオリジンのリスト
const allowedOrigins = ['http://localhost:5173', 'http://localhost:6006'];
const corsOptions = {
  origin: (origin, callback) => {
    // オリジンが許可リストにあるかチェック
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  optionsSuccessStatus: 200
};

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

const port = 5174;

app.get("/api/skyway/token", async (req, res) => {
  const response = await SkywayTokenApi();
  res.send(response);
});

app.post("/api/npc/conversations", async (req, res) => {
  const { conversations } = req.body;
  const response = await NpcApi(conversations);
  res.send(response);
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
