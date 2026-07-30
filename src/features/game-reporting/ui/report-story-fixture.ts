import type {
  ChoiceMap,
  ReportData,
} from "../model/types";

export const reportStoryData: ReportData = {
  choices: [
    {
      decisionId: "MONDAY_STATUS",
      day: "월요일",
      title: "아직 끝나지 않은 일",
      prompt: "끝나지 않은 업무를 완료로 처리할 것인가?",
      total: 184,
      choices: [
        {
          label: "지시대로 완료 처리한다.",
          count: 116,
          percentage: 63,
        },
        {
          label: "대기 상태를 그대로 둔다.",
          count: 68,
          percentage: 37,
        },
      ],
    },
    {
      decisionId: "TUESDAY_OVERTIME",
      day: "화요일",
      title: "퇴근 10분 전의 통보",
      prompt: "퇴근 직전 추가 업무에 어떻게 대응할 것인가?",
      total: 172,
      choices: [
        {
          label: "가방을 내려놓고 작업을 시작한다.",
          count: 91,
          percentage: 53,
        },
        {
          label: "오늘 가능한 범위를 먼저 묻는다.",
          count: 81,
          percentage: 47,
        },
      ],
    },
    {
      decisionId: "WEDNESDAY_BLAME",
      day: "수요일",
      title: "회의 직전의 책임 전가",
      prompt: "떠넘겨진 책임에 어떻게 대응할 것인가?",
      total: 165,
      choices: [
        {
          label: "억울함을 삼키고 먼저 수습한다.",
          count: 64,
          percentage: 39,
        },
        {
          label: "수정하되 전달 경위를 밝힌다.",
          count: 101,
          percentage: 61,
        },
      ],
    },
    {
      decisionId: "THURSDAY_CREDIT",
      day: "목요일",
      title: "평가서에서 사라지는 성과",
      prompt: "평가서에 내 성과를 어떻게 남길 것인가?",
      total: 158,
      choices: [
        {
          label: "성과를 지우고 팀 서포트로 낮춘다.",
          count: 55,
          percentage: 35,
        },
        {
          label: "내가 직접 한 일은 그대로 남긴다.",
          count: 103,
          percentage: 65,
        },
      ],
    },
  ],
  endings: {
    E01: 74,
    E02: 59,
    E03: 25,
  },
};

export const reportStoryChoices: ChoiceMap = {
  MONDAY_STATUS: 0,
  TUESDAY_OVERTIME: 1,
  WEDNESDAY_BLAME: 1,
  THURSDAY_CREDIT: 1,
};
