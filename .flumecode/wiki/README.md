<!-- wiki-synced-to: 26546e62bb4f271fa1de38ba98ae09f6acba4cc2 -->

# hospital-waiting-service 위키

> **TL;DR** — 안과·내과·소아과 3개 진료과의 대기 현황을 카드로 보여주는, 빌드 도구 없는 순수 HTML/CSS/JS 정적 웹페이지입니다. 카드를 누르면 대기자 명단(마스킹)이 펼쳐지고, 내 대기 번호로 알림을 신청하면 순서가 임박할 때 팝업이 뜹니다.

이 저장소는 병원 예약 시스템용 **대기 현황 화면 템플릿**입니다. 프레임워크·번들러·패키지 매니저 없이 브라우저에서 바로 열 수 있는 정적 사이트로, `app.js`가 `fetch`로 `data.json`(현재는 더미 데이터)을 불러와 진료과별 카드를 렌더링합니다. 카드 상호작용(대기자 명단 펼치기, 알림 신청)은 모두 클라이언트에서 일어나며, 실제 백엔드가 없어도 동작하도록 호출 진행을 모의 폴링으로 시뮬레이션합니다. 데이터 소스 URL이 한 상수로 분리돼 있어, 실제 백엔드가 준비되면 그 한 줄만 교체하면 연동됩니다.

## 내비게이션 맵

| 컴포넌트 | 하는 일 | 위키 페이지 | 핵심 경로 |
| --- | --- | --- | --- |
| 프론트엔드 | 대기 현황 화면 전체(구조·스타일·렌더링·상호작용) | [components/frontend.md](components/frontend.md) | `index.html`, `app.js`, `styles.css` |
| 대기자 명단 | 카드 클릭 시 펼쳐지는 마스킹 환자 명단 | [components/frontend.md](components/frontend.md#대기자-명단-펼치기) | `app.js` |
| 알림 신청 | 내 대기 번호 기준 3번째 순서 `alert()` 알림 | [components/frontend.md](components/frontend.md#알림-신청과-모의-폴링) | `app.js` |
| 더미 데이터 | API 응답 형태를 모방한 정적 데이터 | [components/frontend.md](components/frontend.md#데이터-계약-datajson) | `data.json` |

전체 구조와 데이터 흐름은 [architecture.md](architecture.md), 도메인 용어는 [glossary.md](glossary.md)를 참고하세요.

---

**에이전트용 안내** — 이 페이지가 색인입니다. 여기서 시작해 필요한 페이지로 링크를 따라간 뒤, 인용된 소스 경로(`index.html`, `app.js` 등)를 열어 확인하세요.
