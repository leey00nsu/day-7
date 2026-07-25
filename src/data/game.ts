import subtitles from "./subtitles.json";

export type SubtitleCue = {
  start: number;
  end: number;
  speaker?: string;
  text: string;
};

export type StoryClip = {
  filename: string;
  label: string;
  narration?: string;
  cues: readonly SubtitleCue[];
};

export type StoryChapter = {
  day: string;
  title: string;
  clips: readonly StoryClip[];
  decisionId?: DecisionId;
  decisionPrompt?: string;
  decisionThought?: string;
  decisionNarration?: string;
  choices?: readonly [
    { label: string; feedback: string; clips: readonly StoryClip[] },
    { label: string; feedback: string; clips: readonly StoryClip[] },
  ];
};

export const decisionIds = [
  "MONDAY_STATUS",
  "TUESDAY_OVERTIME",
  "WEDNESDAY_BLAME",
  "THURSDAY_CREDIT",
] as const;

export type DecisionId = (typeof decisionIds)[number];

const subtitleTable = subtitles as Record<string, SubtitleCue[]>;

const clip = (
  filename: string,
  label: string,
  narration?: string,
): StoryClip => ({
  filename,
  label,
  narration,
  cues: subtitleTable[filename] ?? [],
});

export const storyChapters: readonly StoryChapter[] = [
  {
    day: "프롤로그",
    title: "결과 발표 일주일 전",
    clips: [
      clip(
        "p00_prologue_s00.mp4",
        "결과 발표 일주일 전",
        "/audio/narration/prologue-p1.mp3",
      ),
      clip("p00_prologue_s01.mp4", "결과 발표 일주일 전"),
      clip("p00_prologue_s02.mp4", "일주일 전"),
    ],
  },
  {
    day: "월요일",
    title: "아직 끝나지 않은 일",
    clips: [
      clip("n01_mon_status_s01.mp4", "일방적인 지시"),
      clip("n01_mon_status_s02.mp4", "조직의 룰"),
      clip("n01_mon_status_s03.mp4", "결정 직전"),
    ],
    decisionId: "MONDAY_STATUS",
    decisionPrompt: "끝나지 않은 업무를 완료로 처리할 것인가?",
    decisionThought:
      "완료로 바꾸자니 찝찝하고, 그대로 두면 부장님이 또 뭐라고 할 텐데.",
    decisionNarration: "/audio/narration/decision-s1.mp3",
    choices: [
      {
        label: "지시대로 완료 처리한다.",
        feedback: "박부장은 김인턴이 지시를 따른 것을 기억할 것입니다.",
        clips: [clip("c01_a_complete_s01.mp4", "찝찝한 완료 처리")],
      },
      {
        label: "대기 상태를 그대로 둔다.",
        feedback:
          "박부장은 김인턴이 지시를 따르지 않은 것을 기억할 것입니다.",
        clips: [clip("c01_a_complete_s01.mp4", "찝찝한 완료 처리")],
      },
    ],
  },
  {
    day: "화요일",
    title: "퇴근 10분 전의 통보",
    clips: [
      clip("n02_tue_late_request_s01.mp4", "퇴근 직전의 업무 지시"),
      clip("n02_tue_late_request_s02.mp4", "일방적인 마감 지시"),
    ],
    decisionId: "TUESDAY_OVERTIME",
    decisionPrompt: "퇴근 직전 추가 업무에 어떻게 대응할 것인가?",
    decisionThought:
      "약속이 있는데... 그렇다고 지금 못 한다고 해도 될까.",
    decisionNarration: "/audio/narration/decision-s2.mp3",
    choices: [
      {
        label: "가방을 내려놓고 작업을 시작한다.",
        feedback: "이대리는 김인턴이 야근을 받아들인 것을 기억할 것입니다.",
        clips: [
          clip("c02_a_finish_tonight_s01.mp4", "남아서 끝내기"),
        ],
      },
      {
        label: "오늘 가능한 범위를 먼저 묻는다.",
        feedback: "이대리는 김인턴이 선을 그은 것을 기억할 것입니다.",
        clips: [
          clip("c02_b_set_scope_s01.mp4", "가능한 범위 정하기"),
        ],
      },
    ],
  },
  {
    day: "수요일",
    title: "회의 직전의 책임 전가",
    clips: [
      clip("n03_wed_wrong_number_s01.mp4", "회의 직전"),
      clip("n03_wed_wrong_number_s02.mp4", "떠넘겨진 책임"),
    ],
    decisionId: "WEDNESDAY_BLAME",
    decisionPrompt: "떠넘겨진 책임에 어떻게 대응할 것인가?",
    decisionThought: "지금 따질까... 아니면 수습부터 해야 할까?",
    decisionNarration: "/audio/narration/decision-s3.mp3",
    choices: [
      {
        label: "억울함을 삼키고 먼저 수습한다.",
        feedback:
          "이대리는 김인턴이 책임을 대신 진 것을 기억할 것입니다.",
        clips: [clip("c03_a_take_blame_s01.mp4", "수습 우선")],
      },
      {
        label: "수정하되 전달 경위를 밝힌다.",
        feedback: "이대리는 김인턴이 경위를 밝힌 것을 기억할 것입니다.",
        clips: [
          clip("c03_b_explain_process_s01.mp4", "전달 경위 밝히기"),
        ],
      },
    ],
  },
  {
    day: "목요일",
    title: "평가서에서 사라지는 성과",
    clips: [
      clip("n04_thu_self_review_s01.mp4", "웃으며 가로채는 공"),
      clip("n04_thu_self_review_s02.mp4", "위계로 누르는 말"),
    ],
    decisionId: "THURSDAY_CREDIT",
    decisionPrompt: "평가서에 내 성과를 어떻게 남길 것인가?",
    decisionThought:
      "내가 한 일을 지워야 하나. 그대로 쓰면 찍힐 것 같고.",
    decisionNarration: "/audio/narration/decision-s4.mp3",
    choices: [
      {
        label: "성과를 지우고 팀 서포트로 낮춘다.",
        feedback: "이대리는 김인턴이 성과를 양보한 것을 기억할 것입니다.",
        clips: [],
      },
      {
        label: "내가 직접 한 일은 그대로 남긴다.",
        feedback: "이대리는 김인턴이 자기 성과를 지킨 것을 기억할 것입니다.",
        clips: [],
      },
    ],
  },
  {
    day: "금요일",
    title: "최종 결과",
    clips: [
      clip("n05_fri_result_intro_s01.mp4", "결과 면담"),
      clip("n05_fri_result_intro_s02.mp4", "최종 결과"),
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
    clips: [
      clip("e01_conversion_s01.mp4", "정규직 전환 통보"),
      clip("e01_conversion_s02.mp4", "축하 뒤의 현실"),
    ],
    narrationAudio: "/audio/narration/ending-e1.mp3",
    narrationText:
      "정규직이 됐다. 그런데 왜... 목줄이 하나 더 채워진 기분일까.",
  },
  {
    id: "E02",
    title: "회사 사정이라는 핑계",
    summary:
      "회사는 인건비 동결을 내세워 전환을 끝낸다. 남은 것은 모호한 위로와 빈 사무실뿐이다.",
    image: "/assets/endings/e02-hold.png",
    clips: [
      clip("e02_hold_s01.mp4", "전환 보류 통보"),
      clip("e02_hold_s02.mp4", "회사의 사정"),
    ],
    narrationAudio: "/audio/narration/ending-e2.mp3",
    narrationText:
      "시키는 일은 다 했다. 하지만 회사는 필요 없을 때 버리기 좋은 핑계만 찾을 뿐이었다.",
  },
  {
    id: "E03",
    title: "김인턴의 거절",
    summary:
      "금요일이 되어서야 알았다. 이 회사와 나는 맞지 않는다는 걸.",
    image: "/assets/endings/e03-decline.png",
    clips: [
      clip("e03_decline_s01.mp4", "전환 제안"),
      clip("e03_decline_s02.mp4", "계약 연장 거절"),
      clip("e03_decline_s05.mp4", "마지막 반응"),
    ],
    narrationAudio: "/audio/narration/ending-e3.mp3",
    narrationText:
      "마지막까지 자기들 걱정 뿐이었다. 내 선택은 틀리지 않았다.",
  },
] as const;

export type EndingId = (typeof endings)[number]["id"];
export type Ending = (typeof endings)[number];

export const decisionDefinitions = storyChapters.flatMap((chapter) =>
  chapter.decisionId && chapter.decisionPrompt && chapter.choices
    ? [
        {
          id: chapter.decisionId,
          day: chapter.day,
          title: chapter.title,
          prompt: chapter.decisionPrompt,
          choices: [
            chapter.choices[0].label,
            chapter.choices[1].label,
          ] as const,
        },
      ]
    : [],
);
