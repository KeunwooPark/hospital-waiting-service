// 실제 API 연동 시 이 URL만 엔드포인트로 교체하세요.
const DATA_SOURCE = './data.json';

// Cached DOM references — queried once on script load.
const statusEl = document.getElementById('status');
const departmentListEl = document.getElementById('department-list');
const updatedAtEl = document.getElementById('updated-at');

// ===== Public entry point =====

async function loadDepartments() {
  showStatus('대기 정보를 불러오는 중…');
  statusEl.classList.remove('error');

  try {
    const res = await fetch(DATA_SOURCE);
    if (!res.ok) {
      throw new Error(`서버 응답 오류: ${res.status}`);
    }
    const data = await res.json();

    renderDepartments(data.departments);
    renderUpdatedAt(data.updatedAt);
    hideStatus();
  } catch (err) {
    showStatus('대기 정보를 불러오지 못했습니다.', true);
    console.error(err);
  }
}

// ===== Rendering helpers =====

function renderDepartments(departments) {
  departmentListEl.replaceChildren(...departments.map(buildCard));
}

function renderUpdatedAt(isoString) {
  updatedAtEl.textContent = toKoreanDateTimeString(isoString);
}

// ===== Card builder =====

function buildCard(department) {
  const card = document.createElement('article');
  card.className = 'department-card';

  const nameEl = document.createElement('h2');
  nameEl.className = 'card-name';
  nameEl.textContent = department.name;

  const statsEl = document.createElement('div');
  statsEl.className = 'card-stats';
  statsEl.appendChild(buildStatRow('대기 시간 약', department.waitMinutes, '분'));
  statsEl.appendChild(buildStatRow('대기 인원', department.waitingCount, '명'));

  card.appendChild(nameEl);
  card.appendChild(statsEl);
  return card;
}

function buildStatRow(label, value, unit) {
  const row = document.createElement('div');
  row.className = 'stat-row';

  const labelEl = document.createElement('span');
  labelEl.textContent = label + ' ';

  const valueEl = document.createElement('span');
  valueEl.className = 'stat-value';
  valueEl.textContent = value;

  const unitEl = document.createElement('span');
  unitEl.className = 'stat-unit';
  unitEl.textContent = unit;

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  row.appendChild(unitEl);
  return row;
}

// ===== Status helpers =====

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
  statusEl.removeAttribute('hidden');
}

function hideStatus() {
  statusEl.setAttribute('hidden', '');
}

// ===== Date formatting =====

function toKoreanDateTimeString(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ===== Bootstrap =====

loadDepartments();

// Uncomment to enable automatic refresh every 30 seconds:
// setInterval(loadDepartments, 30000);
