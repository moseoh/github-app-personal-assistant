import { Probot } from "probot";
import { Router } from "express";
import { createHealthRouter } from "./health.js";
import { checkRequiredFilesInPR } from "./checks/repo-init-check.js";

type ProbotOptions = {
  getRouter: (path?: string) => Router;
};

export default (app: Probot, { getRouter }: ProbotOptions) => {
  // Health Check 라우터 설정
  const router = getRouter("/api");
  router.use("/health", createHealthRouter());

  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on(
    [
      "pull_request.opened",
      "pull_request.reopened",
      "pull_request.synchronize",
    ],
    async (context) => {
      // PR 파일 검사 실행
      await checkRequiredFilesInPR(context);
    }
  );
};
