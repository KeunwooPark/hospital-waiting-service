# 병원 진료 대기 현황

병원 3개 진료과(안과·내과·소아과)의 현재 대기 시간과 대기 인원을 카드 형식으로 보여주는 정적 웹페이지입니다.
빌드 도구나 패키지 매니저 없이 순수 HTML/CSS/JS로 구성되어 있으며, `fetch`로 `data.json`을 불러와 렌더링합니다.

## 파일 구조

```
index.html   — 페이지 구조 (부서 데이터 하드코딩 없음)
styles.css   — 반응형 카드 그리드 레이아웃
app.js       — 데이터 로딩 및 DOM 렌더링 로직
data.json    — 더미 API 응답 데이터
```

## 실행 방법

### 로컬 정적 서버 사용 (권장)

`index.html`을 `file://`로 직접 열면 브라우저의 CORS 정책에 의해 `fetch`가 차단될 수 있습니다.
아래와 같이 간단한 정적 서버를 띄운 뒤 브라우저에서 접속하세요.

**Python 3:**
```bash
python -m http.server
```
그 후 브라우저에서 `http://localhost:8000` 을 엽니다.

**Python 2:**
```bash
python -m SimpleHTTPServer
```

**Node.js (`npx` 사용):**
```bash
npx serve .
```

### 실제 API 연동

`app.js` 최상단의 `DATA_SOURCE` 상수 하나만 실제 엔드포인트 URL로 교체하면 됩니다.

```js
const DATA_SOURCE = 'https://api.example.com/wait-times'; // ← 여기만 바꾸세요
```

API 응답은 `data.json`과 동일한 형태(`updatedAt`, `departments` 배열)여야 합니다.

### 자동 새로고침

`app.js` 하단에 주석 처리된 아래 줄의 주석을 해제하면 30초마다 자동으로 데이터를 갱신합니다.

```js
// setInterval(loadDepartments, 30000);
```
