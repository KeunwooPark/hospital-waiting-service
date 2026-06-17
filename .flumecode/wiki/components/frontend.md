# 프론트엔드

> **TL;DR** — 대기 현황 화면 전체입니다. `index.html`이 골격, `styles.css`가 모양, `app.js`가 `data.json`을 불러와 진료과 카드를 그립니다.

> **Purpose** — 안과·내과·소아과의 대기 시간·대기 인원을 카드로 표시하는 정적 클라이언트.
> **Key files** — `index.html`, `app.js`, `styles.css`, `data.json`.
> **Depends on** — 브라우저 `fetch` API, `data.json`(또는 향후 실제 API).
> **Used by** — 최종 사용자(브라우저). 정적 서버가 파일을 서빙.
> **Related** — [architecture.md](../architecture.md), [glossary.md](../glossary.md).

## 구성 파일

| 파일 | 역할 |
| --- | --- |
| `index.html` | 헤더·상태 영역·빈 카드 컨테이너만 둔 골격 |
| `app.js` | 데이터 로딩 + DOM 렌더링 + 상태/오류 처리 |
| `styles.css` | 반응형 카드 그리드와 카드 스타일 |
| `data.json` | API 응답을 모방한 더미 데이터 |

## index.html — 골격

진료과 데이터를 하드코딩하지 않는 것이 핵심입니다. 마크업에는 자리만 둡니다.

- `#updated-at` — 헤더의 마지막 갱신 시각이 들어갈 `<span>`.
- `#status` — 로딩/오류 메시지 영역. 평소 `hidden`.
- `#department-list` — `app.js`가 카드를 채우는 빈 `<section>`.
- `app.js`는 `defer`로 로드돼 DOM 파싱 이후 실행됩니다.

## app.js — 동작

흐름은 단일 진입점 `loadDepartments()`에서 시작합니다.

1. `showStatus('대기 정보를 불러오는 중…')`로 로딩 표시.
2. `fetch(DATA_SOURCE)` 후 `res.ok`가 아니면 예외 발생.
3. 성공 시 `renderDepartments(data.departments)`와 `renderUpdatedAt(data.updatedAt)` 호출, 상태 숨김.
4. 실패 시 `showStatus(..., true)`로 오류 메시지(빨간 스타일) 표시.

렌더링 세부:

- `renderDepartments()` → 각 진료과를 `buildCard()`로 만들어 `replaceChildren(...)`로 교체. `innerHTML` 문자열 조합 대신 `createElement` 기반으로 DOM을 구성합니다.
- `buildCard()` / `buildStatRow()` → `.department-card` 안에 진료과명과 "대기 시간 약 N분", "대기 인원 N명" 두 줄(`.stat-row`)을 생성. 숫자는 `.stat-value`로 강조.
- `renderUpdatedAt()` → `toKoreanDateTimeString()`이 ISO 문자열을 `toLocaleString('ko-KR', …)`로 한국어 날짜·시각으로 변환.

확장 지점:

- **데이터 소스 교체** — 최상단 `const DATA_SOURCE = './data.json';` 한 줄만 실제 엔드포인트로 바꿉니다.
- **주기적 갱신** — 파일 맨 끝의 `// setInterval(loadDepartments, 30000);` 주석을 해제하면 30초마다 자동 갱신.

## styles.css — 모양

- `#department-list`는 `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`로 폭에 따라 카드 수가 자동 조절되는 반응형 그리드입니다.
- `@media (max-width: 480px)`에서 단일 열로 전환하고 제목·수치 크기를 줄입니다.
- `#status.error`는 오류 상태에 빨간 배경/글자색을 적용합니다.

## 데이터 계약 (data.json)

응답 최상위에 `updatedAt`(ISO 8601 문자열)과 `departments` 배열이 있습니다. 각 진료과 객체의 필드:

| 필드 | 의미 |
| --- | --- |
| `id` | 진료과 식별자(예: `ophthalmology`) |
| `name` | 화면 표시명(예: `안과`) |
| `waitMinutes` | 대기 시간(분) |
| `waitingCount` | 대기 인원(명) |

실제 API는 이 형태와 동일해야 `app.js`가 수정 없이 동작합니다. 현재 데이터는 안과·내과·소아과 3개 과의 더미 값입니다.

## 실행

`index.html`을 정적 서버로 엽니다(예: `python -m http.server` 후 `http://localhost:8000`). 자세한 실행·연동 안내는 저장소 루트 `README.md`에 있습니다.
