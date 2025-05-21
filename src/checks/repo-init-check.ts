import { Context } from "probot";

/**
 * 저장소에 필수 파일들이 존재하는지 확인하는 check run을 생성합니다.
 *
 * @param context Probot 컨텍스트
 */
export async function checkRequiredFilesInPR(context: Context<"pull_request">) {
  const pr = context.payload.pull_request;
  const owner = context.payload.repository.owner.login;
  const repo = context.payload.repository.name;
  const author = pr.user.login; // PR 작성자
  const check_name = "레포지토리 초기화 파일 검사";

  console.log(
    `PR #${pr.number} (${pr.title})에 대한 저장소 초기화 파일 검사 시작`
  );

  // 먼저 진행 중인 Check Run 생성
  let check_run_id;
  try {
    const checkRunResponse = await context.octokit.checks.create({
      owner,
      repo,
      name: check_name,
      head_sha: pr.head.sha,
      status: "in_progress",
      output: {
        title: "레포지토리 초기화 파일 검사 진행 중",
        summary: "필수 파일들의 존재 여부를 확인하는 중입니다...",
      },
    });

    check_run_id = checkRunResponse.data.id;
    console.log(`Check Run 생성 (ID: ${check_run_id})`);
  } catch (error) {
    console.error("Check Run 생성 중 오류 발생:", error);
    return; // 초기 Check Run 생성 실패 시 종료
  }

  // 검사할 파일 목록 정의 - PR 작성자 정보로 동적 생성
  const filesToCheck = [
    `.repo/githook/.hook-installed/${author}`,
    `.repo/github/.gh-settings/auto-delete-branch`,
    `.repo/github/.gh-settings/protect-branch`,
    `.repo/github/.gh-settings/set-squash-merge`,
  ];

  // 파일 존재 여부 확인 결과 저장
  const existingFiles: string[] = [];
  const missingFiles: string[] = [];

  // 각 파일의 존재 여부 확인
  for (const file of filesToCheck) {
    try {
      // 파일 존재 여부 확인 (API 호출)
      await context.octokit.repos.getContent({
        owner,
        repo,
        path: file,
        ref: pr.base.ref, // 베이스 브랜치(보통 main)에서 확인
      });

      // 파일이 존재하면 existingFiles에 추가
      existingFiles.push(file);
      console.log(`✅ 파일 존재: ${file}`);
    } catch (error) {
      // 파일이 없으면 missingFiles에 추가
      missingFiles.push(file);
      console.log(`❌ 파일 누락: ${file}`);
    }
  }

  // 모든 필수 파일이 있는지 확인
  const allFilesPresent = missingFiles.length === 0;

  // 결과 메시지 생성
  let summary = "";
  if (allFilesPresent) {
    summary = "✅ 모든 필수 파일이 레포지토리에 존재합니다.";
  } else {
    summary = "❌ 다음 필수 파일이 레포지토리에 없습니다:\n\n";
    summary += missingFiles.map((file) => `- \`${file}\``).join("\n");
    summary += "\n\n이 파일들을 추가해주세요.";
  }

  // 존재하는 파일에 대한 정보 추가
  if (existingFiles.length > 0) {
    summary += "\n\n✅ 레포지토리에 존재하는 필수 파일:\n\n";
    summary += existingFiles.map((file) => `- \`${file}\``).join("\n");
  }

  // Check Run 결과 업데이트
  try {
    await context.octokit.checks.update({
      owner,
      repo,
      check_run_id,
      status: "completed",
      conclusion: allFilesPresent ? "success" : "failure",
      completed_at: new Date().toISOString(),
      output: {
        title: allFilesPresent
          ? "모든 필수 설정 파일이 존재함"
          : "필수 설정 파일이 누락됨",
        summary,
      },
    });

    console.log(
      `레포지토리 초기화 파일 검사 결과: ${allFilesPresent ? "성공" : "실패"}`
    );
  } catch (error) {
    console.error("Check Run 업데이트 중 오류 발생:", error);
  }
}
