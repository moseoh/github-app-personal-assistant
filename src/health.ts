import { Router } from "express";

/**
 * Health Check 라우터를 생성합니다.
 *
 * @returns Express 라우터
 */
export function createHealthRouter(): Router {
  const router = Router();

  // 기본 health check 경로
  router.get("/", (_, res) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: "GitHub App is running",
    });
  });

  // 더 상세한 health check 경로
  router.get("/detail", (_, res) => {
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: "GitHub App is running",
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      env: process.env.NODE_ENV || "development",
      platform: process.platform,
      nodeVersion: process.version,
    });
  });

  return router;
}
