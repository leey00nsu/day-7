# 정규직 D-7 · Game

AI 영상 기반 인터랙티브 오피스 드라마의 실제 개발 프로젝트입니다.

## 기술 구성

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui CSS Variables
- Kibo UI
- Storybook 10
- Pretendard Variable
- pnpm

## 실행

```bash
pnpm install
pnpm dev
```

검수:

```bash
pnpm lint
pnpm build
pnpm build-storybook
pnpm test-storybook
```

## 현재 화면

- `/` — `t00_title_s01.mp4`를 무한 재생하는 시네마틱 홈
- `/story` — 보유 영상 자동 재생, HTML 자막, 좌우 선택 분기
- `/endings` — 개편된 엔딩 키아트 3종
- `/library` — 저장과 재생 설정
- `/ranking` — 랭킹 화면의 초기 상태

영상 원본은 `../outputs/videos`에 둡니다. 앱은 `/api/videos/[filename]`
경로에서 해당 파일을 Range 스트리밍하므로 영상 파일을 저장소 안으로
복사하지 않습니다. 아직 없는 파일은 재생 목록에 넣지 않습니다.

자막 문구와 노출 시간은 `src/data/subtitles.json`에서 관리합니다.
영상 파일명을 키로 사용하고 `start`, `end`, `speaker`, `text`를 수정하면
게임 자막에 바로 반영됩니다. 장면 전환은 두 영상 레이어를 번갈아
사용해 다음 영상이 준비될 때까지 직전 마지막 프레임을 유지합니다.

## UI 개발

```bash
pnpm storybook
```

Storybook은 `http://localhost:6006`에서 실행됩니다. 다음 항목을 개별적으로
검수할 수 있습니다.

- shadcn 기반 Button과 기본 프리미티브
- GlassCard와 7단계 ProgressSteps
- Kibo UI Announcement, Choicebox, Status, Pill
- 상시 옵션, 자막, 좌우 선택 오버레이
- 전체 스토리 선택 화면
- 홈, 랭킹, 엔딩, 기록·설정 화면

Kibo UI는 필요한 구성 요소의 소스만 `src/components/kibo-ui` 아래에
가져오는 방식으로 사용합니다. 공통 색상과 모서리, 포커스 링은
`src/app/globals.css`의 shadcn CSS Variables에서 관리합니다.

## 이전 목업에서 가져온 기준

`web-ui-mockups`의 글래스 카드, 선택 버튼, 진행 표시, 최소 44px
터치 영역과 접근성 방향을 재사용했습니다. 오래된 증거 수집 화면, 사원증,
보고서, 메신저 이미지, Cloudflare/Drizzle 예제는 가져오지 않았습니다.

`html_mockups`와 `web-ui-mockups`는 디자인 참고 자료로만 유지하고, 앞으로의
게임 구현은 이 저장소를 원본으로 관리합니다.
