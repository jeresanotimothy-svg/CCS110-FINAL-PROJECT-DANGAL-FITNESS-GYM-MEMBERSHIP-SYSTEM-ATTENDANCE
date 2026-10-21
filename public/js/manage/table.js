// Table
function money(value) {
  return '₱' + Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function actionButton(style, icon, label, onclick) {
  return `<button class="btn btn-sm ${style}" onclick="${onclick}"><i class="bi ${icon}" aria-hidden="true"></i>${label}</button>`;
}

function statusCell(row, value) {
  if (!can(['Admin'])) return badge(value);
  const options = mod.statuses.map(s => `<option ${s === value ? 'selected' : ''}>${s}</option>`).join('');
  return `<select class="form-select form-select-sm status-select" aria-label="Change status"
            onchange="changeStatus(${row[mod.pk]}, this.value)">${options}</select>`;
}

function cellHtml(row, col) {
  const [key, , type] = col;
  const value = row[key];
  switch (type) {
    case 'money': return money(value);
    case 'dash': return value ? esc(value) : '—';
    case 'role': return badge(value, value === 'Admin' ? 'admin' : 'role');
    case 'active': return value ? badge('Enabled', 'enabled') : badge('Disabled', 'disabled');
    case 'checkout': return value ? esc(value) : badge('Still inside', 'in');
    case 'status': return statusCell(row, value);
    default: return esc(value);
  }
}

function userButtons(row, index) {
  const id = row[mod.pk];
  const password = actionButton('btn-outline-secondary', 'bi-key', 'Password', `openReset(${index})`);
  if (id === window.currentUser.user_id) return password;
  return password + (row.is_active
    ? actionButton('btn-danger', 'bi-person-slash', 'Disable', `toggleUser(${id}, false)`)
    : actionButton('btn-success', 'bi-person-check', 'Enable', `toggleUser(${id}, true)`));
}

function recordButtons(row, index, showingHidden) {
  const id = row[mod.pk];
  let html = '';
  if (mod.canEdit && can(mod.canEdit) && !showingHidden)
    html += actionButton('btn-info', 'bi-pencil-square', 'Edit', `openEdit(${index})`);
  if (mod.canHide && can(mod.canHide))
    html += showingHidden
      ? actionButton('btn-success', 'bi-eye', 'Unhide', `hideRecord(${id}, false)`)
      : actionButton('btn-warning', 'bi-eye-slash', 'Hide', `hideRecord(${id}, true)`);
  return html;
}

function actionCell(row, index, showingHidden) {
  const buttons = mod.users ? userButtons(row, index) : recordButtons(row, index, showingHidden);
  return `<td><div class="action-buttons">${buttons}</div></td>`;
}

function hasActions() {
  return mod.users ? can(mod.canAdd) : can(mod.canEdit || []) || can(mod.canHide || []);
}

function recordsUrl() {
  const q = document.getElementById('searchBox').value.trim();
  const filter = document.getElementById('filterBox').value;
  const hidden = document.getElementById('showHidden').checked ? 1 : 0;
  const sort = mod.sort ? `&sort=${encodeURIComponent(sortKey)}&dir=${sortDir}` : '';
  return `/api/${moduleName}?q=${encodeURIComponent(q)}&filter=${encodeURIComponent(filter)}&hidden=${hidden}${sort}`;
}

function renderTable(showingHidden) {
  const actions = hasActions();
  document.getElementById('recordCount').textContent = records.length + ' record(s)';
  document.getElementById('tableHead').innerHTML = '<tr>'
    + mod.columns.map(c => `<th scope="col">${c[1]}</th>`).join('')
    + (actions ? '<th scope="col">Actions</th>' : '') + '</tr>';

  const rows = records.map((row, i) =>
    '<tr>' + mod.columns.map(c => `<td>${cellHtml(row, c)}</td>`).join('')
    + (actions ? actionCell(row, i, showingHidden) : '') + '</tr>').join('');

  const empty = showingHidden ? 'No hidden records.' : 'No records found.';
  const span = mod.columns.length + (actions ? 1 : 0);
  document.getElementById('tableBody').innerHTML =
    rows || `<tr><td colspan="${span}" class="text-center">${empty}</td></tr>`;
}

async function loadRecords() {
  try {
    const data = await api(recordsUrl());
    if (!data) return;
    records = data;
  } catch (err) {
    showMessage(err.message, 'danger');
    return;
  }
  renderTable(document.getElementById('showHidden').checked);
}

// Row actions
async function changeStatus(id, status) {
  try {
    await api(`/api/${moduleName}/${id}/status`, 'PATCH', { status });
    showMessage('Status changed to ' + status + '.', 'success');
  } catch (err) { showMessage(err.message, 'danger'); }
  loadRecords();
}

async function hideRecord(id, hidden) {
  const question = hidden
    ? 'Hide this record? It is not deleted: an Admin can unhide it later.'
    : 'Unhide this record?';
  if (!confirm(question)) return;
  try {
    await api(`/api/${moduleName}/${id}/hidden`, 'PATCH', { hidden });
    showMessage(hidden ? 'Record hidden.' : 'Record is visible again.', 'success');
  } catch (err) { showMessage(err.message, 'danger'); }
  loadRecords();
  if (mod.board) loadBoard();
}

async function toggleUser(id, active) {
  if (!active && !confirm('Disable this account? The person will not be able to log in.')) return;
  try {
    await api(`/api/users/${id}/active`, 'PATCH', { active });
    showMessage(active ? 'Account enabled.' : 'Account disabled.', 'success');
  } catch (err) { showMessage(err.message, 'danger'); }
  loadRecords();
}
