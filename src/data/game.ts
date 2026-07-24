export const weeklyChoices = [
  {
    day: "월요일",
    title: "아직 끝나지 않은 일",
    speaker: "이대리",
    dialogue: "그냥 부장님 하라는 대로 해. 미결 달아봤자 우리 팀만 깨져.",
    choices: [
      "보고 마감에 맞춰 완료로 표시한다.",
      "진행 상태와 미해결 사유를 남긴다.",
    ],
  },
  {
    day: "화요일",
    title: "퇴근 직전의 부탁",
    speaker: "이대리",
    dialogue:
      "내가 뼈대 다시 잡을 테니까, 옆에서 숫자만 빨리 크로스체크해 줘.",
    choices: [
      "개인 일정을 조정해 오늘 모두 끝낸다.",
      "정확한 작업 범위와 일정을 제시한다.",
    ],
  },
  {
    day: "수요일",
    title: "잘못된 숫자",
    speaker: "박부장",
    dialogue: "김 인턴, 원래 단가로 롤백해서 다시 뽑아 와. 뛰어!",
    choices: [
      "억울함을 삼키고 먼저 수습한다.",
      "수정하되 자료 전달 경위를 밝힌다.",
    ],
  },
  {
    day: "목요일",
    title: "평가서에서 사라지는 성과",
    speaker: "박부장",
    dialogue:
      "평가서에 개인플레이 적어봤자 마이너스야. 팀 서포트로 톤다운해.",
    choices: [
      "내 성과를 지우고 팀 서포트로 낮춘다.",
      "내가 직접 한 일은 평가서에 남긴다.",
    ],
  },
] as const;

export const endings = [
  {
    id: "E01",
    title: "정규직이라는 족쇄",
    summary:
      "인력 부족 때문에 전환이 결정됐다. 축하보다 먼저, 더 많은 야근이 기다린다는 말이 돌아온다.",
    image: "/assets/endings/e01-conversion.png",
  },
  {
    id: "E02",
    title: "회사 사정이라는 핑계",
    summary:
      "회사는 인건비 동결을 내세워 전환을 끝낸다. 남은 것은 모호한 위로와 빈 사무실뿐이다.",
    image: "/assets/endings/e02-hold.png",
  },
  {
    id: "E03",
    title: "김인턴의 거절",
    summary:
      "금요일이 되어서야 알았다. 이 회사와 나는 맞지 않는다는 걸.",
    image: "/assets/endings/e03-decline.png",
  },
] as const;
