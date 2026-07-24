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

export type SubtitleCue = {
  start: number;
  end: number;
  speaker?: string;
  text: string;
};

export type StoryClip = {
  filename: string;
  label: string;
  cues?: readonly SubtitleCue[];
};

export type StoryChapter = {
  day: string;
  title: string;
  clips: readonly StoryClip[];
  choices: readonly [
    { label: string; clips: readonly StoryClip[] },
    { label: string; clips: readonly StoryClip[] },
  ];
};

const clip = (
  filename: string,
  label: string,
  cues: readonly SubtitleCue[] = [],
): StoryClip => ({ filename, label, cues });

export const storyChapters: readonly StoryChapter[] = [
  {
    day: "월요일",
    title: "아직 끝나지 않은 일",
    clips: [
      clip("p00_prologue_s00.mp4", "결과 발표 일주일 전"),
      clip("p00_prologue_s01.mp4", "결과 발표 일주일 전", [
        {
          start: 0.45,
          end: 5.9,
          speaker: "박부장",
          text: "김 인턴, 다음 주 금요일 전환 결과 나오는 건 알지?",
        },
        { start: 6, end: 7.7, speaker: "김인턴", text: "네." },
      ]),
      clip("p00_prologue_s02.mp4", "일주일 전", [
        {
          start: 0.5,
          end: 7.7,
          speaker: "김인턴",
          text: "일주일 남았다. 남을지, 끝날지.",
        },
      ]),
      clip("n01_mon_status_s01.mp4", "일방적인 지시", [
        {
          start: 0.3,
          end: 3.55,
          speaker: "박부장",
          text: "김 인턴, 주간보고 왜 아직 대기야? 윗선 들어가니까 일단 완료 띄워.",
        },
        {
          start: 3.6,
          end: 5.85,
          speaker: "김인턴",
          text: "아... 아직 고객사 회신이 안 와서...",
        },
      ]),
      clip("n01_mon_status_s02.mp4", "조직의 룰", [
        {
          start: 0.15,
          end: 1.5,
          speaker: "박부장",
          text: "나중에 비고란에 쓰든가 해. 빨리 올려.",
        },
        {
          start: 1.55,
          end: 3.45,
          speaker: "이대리",
          text: "그냥 부장님 하라는 대로 해. 미결 달아봤자 우리 팀만 깨져.",
        },
      ]),
      clip("n01_mon_status_s03.mp4", "결정 직전"),
    ],
    choices: [
      {
        label: "지시대로 완료 처리한다.",
        clips: [
          clip("c01_a_complete_s01.mp4", "찝찝한 완료 처리"),
        ],
      },
      {
        label: "대기 상태를 그대로 둔다.",
        clips: [],
      },
    ],
  },
  {
    day: "화요일",
    title: "퇴근 10분 전의 통보",
    clips: [
      clip("n02_tue_late_request_s00.mp4", "퇴근 10분 전"),
    ],
    choices: [
      {
        label: "가방을 내려놓고 숫자를 맞춘다.",
        clips: [],
      },
      {
        label: "오늘 가능한 범위를 먼저 묻는다.",
        clips: [],
      },
    ],
  },
  {
    day: "수요일",
    title: "회의 직전의 책임 전가",
    clips: [
      clip("n03_wed_wrong_number_s01.mp4", "회의 직전", [
        {
          start: 0.35,
          end: 4.1,
          speaker: "박부장",
          text: "이 대리, 단가표 뭐야? 영업팀 원본 그대로 넣었어?",
        },
        {
          start: 4.15,
          end: 7.8,
          speaker: "이대리",
          text: "아... 김 인턴이 취합해서, 제가 못 봤습니다.",
        },
      ]),
      clip("n03_wed_wrong_number_s02.mp4", "떠넘겨진 책임", [
        {
          start: 0.3,
          end: 4.85,
          speaker: "박부장",
          text: "누가 했든 회의 10분 전이야. 김 인턴, 원래 단가로 롤백해서 다시 뽑아 와. 뛰어!",
        },
        {
          start: 4.9,
          end: 6.2,
          speaker: "김인턴",
          text: "아... 네, 알겠습니다!",
        },
      ]),
    ],
    choices: [
      {
        label: "억울함을 삼키고 먼저 수습한다.",
        clips: [
          clip("c03_a_take_blame_s01.mp4", "수습 우선", [
            {
              start: 0.35,
              end: 3.8,
              speaker: "김인턴",
              text: "죄송합니다. 바로 수정하겠습니다.",
            },
          ]),
          clip("c03_a_take_blame_s02.mp4", "회의실로 향하는 길"),
        ],
      },
      {
        label: "수정하되 전달 경위를 밝힌다.",
        clips: [],
      },
    ],
  },
  {
    day: "목요일",
    title: "평가서에서 사라지는 성과",
    clips: [
      clip("n04_thu_self_review_s01.mp4", "웃으며 가로채는 공", [
        {
          start: 0.35,
          end: 4.5,
          speaker: "이대리",
          text: "김 인턴, A프로젝트 네가 다 한 것처럼 쓰면... 나는 뭐가 되니?",
        },
        {
          start: 4.55,
          end: 6.8,
          speaker: "김인턴",
          text: "그치만 엑셀 작업은 제가 다...",
        },
      ]),
      clip("n04_thu_self_review_s02.mp4", "위계로 누르는 말", [
        {
          start: 0.35,
          end: 5.75,
          speaker: "박부장",
          text: "김 인턴, 평가서에 개인플레이 적어봤자 마이너스야. 팀 서포트로 톤다운해.",
        },
        {
          start: 5.8,
          end: 7.7,
          speaker: "김인턴",
          text: "...네, 알겠습니다.",
        },
      ]),
    ],
    choices: [
      {
        label: "성과를 지우고 팀 서포트로 낮춘다.",
        clips: [],
      },
      {
        label: "내가 직접 한 일은 그대로 남긴다.",
        clips: [],
      },
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
