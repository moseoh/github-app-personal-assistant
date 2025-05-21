import { Probot } from "probot";
import { checkRequiredFilesInPR } from "./checks/repo-init-check.js";

export default (app: Probot) => {
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
