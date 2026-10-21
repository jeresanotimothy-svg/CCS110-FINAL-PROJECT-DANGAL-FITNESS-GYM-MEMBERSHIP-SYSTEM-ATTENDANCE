// Check-in board
function insideText(since) {
  const day = since.slice(0, 10);
  const time = since.slice(11, 16);
  return 'Inside since ' + (day === Validators.todayString() ? time : day + ' ' + time);
}

function memberTile(m) {
  const inside = !!m.inside_since;
  const status = inside ? badge(insideText(m.inside_since), 'in') : badge('Not checked in', 'cancelled');
  const button = inside
    ? `<button class="btn btn-danger w-100" onclick="checkOut(${m.member_id})"><i class="bi bi-box-arrow-right" aria-hidden="true"></i>Check Out</button>`
    : `<button class="btn btn-success w-100" onclick="checkIn(${m.member_id})"><i class="bi bi-box-arrow-in-right" aria-hidden="true"></i>Check In</button>`;
  return `<div class="col"><div class="card member-tile h-100 ${inside ? 'is-inside' : ''}"><div class="card-body">
      <div class="member-name">${esc(m.first_name + ' ' + m.last_name)}</div>
      <div class="text-muted small mb-2">${esc(m.plan_name || 'No plan')}</div>
      <div class="mb-3">${status}</div>
      ${button}
    </div></div></div>`;
}

function renderBoard() {
  const q = document.getElementById('boardSearch').value.trim().toLowerCase();
  const html = boardMembers
    .filter(m => (m.first_name + ' ' + m.last_name).toLowerCase().includes(q))
    .map(memberTile).join('');
  document.getElementById('boardList').innerHTML =
    html || '<div class="col-12 text-muted">No active members found.</div>';
}

async function loadBoard() {
  try {
    const data = await api('/api/attendance/board');
    if (data) { boardMembers = data; renderBoard(); }
  } catch (err) { showMessage(err.message, 'danger'); }
}

async function boardAction(path, member_id, doneText) {
  const member = boardMembers.find(m => m.member_id === member_id);
  try {
    await api('/api/attendance/' + path, 'POST', { member_id });
    showMessage((member ? member.first_name + ' ' + member.last_name + ' ' : '') + doneText, 'success');
  } catch (err) { showMessage(err.message, 'danger'); }
  loadBoard();
  loadRecords();
}

function checkIn(id) { return boardAction('checkin', id, 'checked in.'); }
function checkOut(id) { return boardAction('checkout', id, 'checked out.'); }

function setupBoard() {
  document.getElementById('boardSection').classList.remove('d-none');
  document.getElementById('tableTitleText').textContent = 'Attendance Log';
  document.getElementById('tableTitle').classList.remove('d-none');
  document.getElementById('boardSearch').addEventListener('input', renderBoard);
  loadBoard();
}
