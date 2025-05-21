import "dotenv/config";
import { createNodeMiddleware, createProbot } from "probot";
import express from "express";
import { createHealthRouter } from "./health.js";
import appFunction from "./index.js";

// Express 서버 생성
const server = express();

// Probot 미들웨어를 /api/github 경로에 마운트
const middleware = createNodeMiddleware(appFunction, {
  probot: createProbot({
    env: {
      APP_ID: process.env.APP_ID,
      PRIVATE_KEY: process.env.PRIVATE_KEY,
      WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    },
  }),
  webhooksPath: "/api/github/webhooks",
});

server.use((req, res, next) => {
  middleware(req, res, next).catch(next);
});

// Health Check 라우터를 /api/health 경로에 마운트
server.use("/api/health", createHealthRouter());

// 404 처리
server.use((_, res) => {
  res.status(404).json({ error: "Not Found" });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
