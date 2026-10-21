// Manage page start
function setupPage() {
  document.getElementById('pageTitle').textContent = mod.title;
  document.getElementById('pageIcon').className = 'bi ' + (mod.icon || 'bi-grid-fill');
  document.title = mod.title + ' - Dangal Fitness System';

  if (mod.note) {
    const note = document.getElementById('pageNote');
    note.textContent = mod.note;
    note.classList.remove('d-none');
  }
  if (mod.canAdd && can(mod.canAdd)) document.getElementById('addBtn').classList.remove('d-none');
  if (mod.canHide && can(mod.canHide)) document.getElementById('hiddenCol').classList.remove('d-none');
  if (mod.sort) setupSort();
  if (mod.filter) setupFilter();
  if (mod.board) setupBoard();
}

function setupFilter() {
  const box = document.getElementById('filterBox');
  box.innerHTML = `<option value="">${mod.filterLabel || 'All'}</option>`
    + mod.filter.map(o => `<option>${o}</option>`).join('');
  document.getElementById('filterCol').classList.remove('d-none');
  box.addEventListener('change', loadRecords);
}

function setupEvents() {
  document.getElementById('addBtn').addEventListener('click', async () => { await loadChoices(); openAdd(); });
  document.getElementById('saveBtn').addEventListener('click', saveRecord);
  document.getElementById('searchBtn').addEventListener('click', loadRecords);
  document.getElementById('showHidden').addEventListener('change', loadRecords);
  document.getElementById('searchBox').addEventListener('keydown', e => { if (e.key === 'Enter') loadRecords(); });
  document.getElementById('formFields').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); saveRecord(); }
  });
}

(async () => {
  await loadNavbar();
  if (!mod || !can(mod.roles)) { window.location.href = 'index.html'; return; }
  setupPage();
  setupEvents();
  loadRecords();
})();
