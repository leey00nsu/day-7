# 정규직 D-7 · Game

AI 영상 기반 인터랙티브 오피스 드라마의 실제 개발 프로젝트입니다.

## 기술 구성

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
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
```

## 현재 화면

- `/` — 시네마틱 홈
- `/story` — 8초 영상형 대화·선택 화면의 초기 런타임
- `/endings` — 개편된 엔딩 키아트 3종
- `/library` — 저장과 재생 설정

## 이전 목업에서 가져온 기준

`web-ui-mockups`의 글래스 카드, 선택 버튼, 진행 표시, 최소 44px
터치 영역과 접근성 방향을 재사용했습니다. 오래된 증거 수집 화면, 사원증,
보고서, 메신저 이미지, Cloudflare/Drizzle 예제는 가져오지 않았습니다.

`html_mockups`와 `web-ui-mockups`는 디자인 참고 자료로만 유지하고, 앞으로의
게임 구현은 이 저장소를 원본으로 관리합니다.
