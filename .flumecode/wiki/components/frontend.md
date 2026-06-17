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
3. 성공 시 응답 `departments`를 모듈 수준 `latestDepartments`에 저장하고 `renderDepartments()`/`renderUpdatedAt()` 호출, 상태 숨김, `startMockPolling()` 1회 등록.
4. 실패 시 `showStatus(..., true)`로 오류 메시지(빨간 스타일) 표시.

`latestDepartments`(최신 데이터), `notifySubscriptions`(진료과별 구독 Map), `pollHandle`(폴링 중복 방지)는 파일 상단의 모듈 수준 상태입니다. 모의 폴링이 `latestDepartments`를 직접 수정하므로, 모든 핸들러는 이 단일 배열을 진실의 원천으로 삼습니다.

렌더링 세부:

- `renderDepartments()` → 각 진료과를 `buildCard()`로 만들어 `replaceChildren(...)`로 교체. `innerHTML` 문자열 조합 대신 `createElement` 기반으로 DOM을 구성합니다. 매 렌더는 카드를 새로 만들므로, 펼침/구독 같은 상태는 DOM이 아니라 모듈 상태(`notifySubscriptions`)에서 복원됩니다.
- `buildCard()` / `buildStatRow()` → `.department-card` 안에 진료과명, "대기 시간 약 N분"·"대기 인원 N명" 두 줄(`.stat-row`), 대기자 명단, 알림 섹션을 차례로 생성. 숫자는 `.stat-value`로 강조.
- `renderUpdatedAt()` → `toKoreanDateTimeString()`이 ISO 문자열을 `toLocaleString('ko-KR', …)`로 한국어 날짜·시각으로 변환.

### 대기자 명단 펼치기

`buildCard()`는 카드를 접근성 있는 토글 버튼으로 만듭니다. `role="button"`, `tabindex="0"`, `aria-expanded`를 부여하고, 클릭과 Enter/Space 키(`handleKeydown`)로 대기자 명단(`buildPatientList`)의 `hidden`을 토글합니다. 명단은 기본 접힌 상태이며, 토글 시 `aria-expanded`도 함께 갱신됩니다.

표시 제어는 전적으로 HTML `hidden` 속성에 위임합니다. 다만 작성자 규칙 `.patient-list { display: flex; }`가 브라우저 기본의 `[hidden] { display: none }`보다 우선하므로, `styles.css`에 더 높은 특이도의 `.patient-list[hidden] { display: none; }` 규칙이 함께 있어야 `hidden=true`가 실제로 화면에서 사라집니다(이 규칙이 없으면 토글이 동작해도 명단이 항상 펼쳐진 채로 보입니다). 자세한 내용은 아래 [styles.css](#stylescss--모양) 참고.

- `buildPatientList()` → `waitingPatients`가 있으면 `buildPatientItem()`으로 `<li>`를 만들고, 비었으면 "대기 중인 환자가 없습니다." 안내(`.patient-empty`)를 렌더.
- `maskName()` → 개인정보 보호를 위해 이름을 마스킹합니다. 첫 글자와 끝 글자만 남기고 가운데를 `*`로 채우며(2글자면 끝 글자도 가림, 1글자면 `*`), `Array.from`으로 유니코드를 안전하게 분해합니다.

### 알림 신청과 모의 폴링

내 대기 번호를 입력해 알림을 신청하면, 모의 폴링으로 호출이 진행되어 내 순서가 3번째가 되는 첫 시점에 `alert()`가 한 번 뜹니다.

- `buildNotifySection(department)` → `.card-notify` 영역. 카드 토글로 번지지 않도록 내부 click·keydown 이벤트의 전파를 막습니다. `notifySubscriptions`에 구독이 없으면 대기 번호 입력란(`.notify-input`)과 '알림 신청' 버튼(`.notify-btn`)을, 있으면 `position = ticketNumber - currentNumber`로 계산한 순서 상태(`.notify-status`, "내 순서: N번째 (알림 신청됨)" 또는 "진료 순서가 지났습니다.")를 렌더.
- `handleSubscribe(departmentId, rawValue)` → 입력값을 정수로 바꾸고, 정수가 아니거나 `currentNumber` 이하면 안내 `alert()` 후 종료. 유효하면 `notifySubscriptions.set(id, { ticketNumber, alerted: false })` 후 다시 렌더.
- `startMockPolling()` → `pollHandle` 가드로 중복 등록을 막고, `POLL_INTERVAL_MS`(3000ms)마다 각 과의 `waitingCount > 0`이면 `currentNumber += 1`·`waitingCount -= 1` 한 뒤 다시 렌더하고 `checkNotifications()` 호출.
- `checkNotifications()` → 구독별 `position`이 `> 0 && <= 3`이고 아직 `alerted`가 아니면 진료과명이 담긴 `alert()`를 띄우고 `sub.alerted = true`로 표시해 중복 발동을 막습니다.

확장 지점:

- **데이터 소스 교체** — 최상단 `const DATA_SOURCE = './data.json';` 한 줄만 실제 엔드포인트로 바꿉니다.
- **실제 호출 연동** — `startMockPolling()`의 더미 증감을 실제 폴링/푸시로 교체하면 모의 시뮬레이션이 실제 호출 진행으로 바뀝니다.
- **알림 임계값** — `checkNotifications()`의 `position <= 3` 기준을 바꿔 알림 시점을 조정합니다.

## styles.css — 모양

- `#department-list`는 `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`로 폭에 따라 카드 수가 자동 조절되는 반응형 그리드입니다.
- `@media (max-width: 480px)`에서 단일 열로 전환하고 제목·수치 크기를 줄입니다.
- `#status.error`는 오류 상태에 빨간 배경/글자색을 적용합니다.
- `.card-notify`는 카드 하단에 상단 구분선과 함께 입력란·버튼을 한 줄로 배치하고, `.notify-status`는 신청 완료 상태를 파란색 굵은 글씨로 강조합니다.
- `.patient-list`는 펼침 시 `display: flex`로 세로 정렬합니다. 이 작성자 규칙이 브라우저 기본 `[hidden] { display: none }`을 덮어쓰므로, 바로 뒤에 `.patient-list[hidden] { display: none; }`(특이도 0,1,1 > 0,1,0)를 두어 `hidden` 토글이 실제로 명단을 숨기도록 보장합니다. `app.js`가 `hidden`으로 표시를 제어하는 패턴이 화면에 반영되려면 이 규칙이 필수입니다.

## 데이터 계약 (data.json)

응답 최상위에 `updatedAt`(ISO 8601 문자열)과 `departments` 배열이 있습니다. 각 진료과 객체의 필드:

| 필드 | 의미 |
| --- | --- |
| `id` | 진료과 식별자(예: `ophthalmology`) |
| `name` | 화면 표시명(예: `안과`) |
| `waitMinutes` | 대기 시간(분) |
| `waitingCount` | 대기 인원(명) |
| `waitingPatients` | 대기 환자 이름 배열(화면에는 마스킹 표시) |
| `currentNumber` | 현재 호출 중인 번호. 내 대기 번호와의 차이로 순서 계산 |

`currentNumber`는 진료과별로 구분되는 기준값(100/200/300)으로 두어 사용자가 임의의 대기 번호를 시험하기 쉽게 했습니다. 실제 API는 이 형태와 동일해야 `app.js`가 수정 없이 동작합니다. 현재 데이터는 안과·내과·소아과 3개 과의 더미 값입니다.

## 실행

`index.html`을 정적 서버로 엽니다(예: `python -m http.server` 후 `http://localhost:8000`). 자세한 실행·연동 안내는 저장소 루트 `README.md`에 있습니다.
