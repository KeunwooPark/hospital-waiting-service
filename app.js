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
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-expanded', 'false');

  const nameEl = document.createElement('h2');
  nameEl.className = 'card-name';
  nameEl.textContent = department.name;

  const statsEl = document.createElement('div');
  statsEl.className = 'card-stats';
  statsEl.appendChild(buildStatRow('대기 시간 약', department.waitMinutes, '분'));
  statsEl.appendChild(buildStatRow('대기 인원', department.waitingCount, '명'));

  const patientList = buildPatientList(department.waitingPatients);
  patientList.hidden = true;

  function toggle() {
    patientList.hidden = !patientList.hidden;
    card.setAttribute('aria-expanded', String(!patientList.hidden));
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  }

  card.addEventListener('click', toggle);
  card.addEventListener('keydown', handleKeydown);

  card.appendChild(nameEl);
  card.appendChild(statsEl);
  card.appendChild(patientList);
  return card;
}

function buildPatientList(waitingPatients) {
  const list = document.createElement('ul');
  list.className = 'patient-list';

  const hasPatients = Array.isArray(waitingPatients) && waitingPatients.length > 0;
  if (hasPatients) {
    waitingPatients.forEach(function (p) {
      list.appendChild(buildPatientItem(p));
    });
  } else {
    const emptyEl = document.createElement('li');
    emptyEl.className = 'patient-empty';
    emptyEl.textContent = '대기 중인 환자가 없습니다.';
    list.appendChild(emptyEl);
  }

  return list;
}

function buildPatientItem(p) {
  const raw = typeof p === 'string' ? p : (p && p.name);
  const li = document.createElement('li');
  li.className = 'patient-item';
  li.textContent = maskName(raw);
  return li;
}

function maskName(fullName) {
  const name = String(fullName ?? '').trim();
  const chars = Array.from(name); // 유니코드 안전 분해
  if (chars.length === 0) return '';
  if (chars.length === 1) return '*';
  if (chars.length === 2) return chars[0] + '*';
  return chars[0] + '*'.repeat(chars.length - 2) + chars[chars.length - 1];
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
