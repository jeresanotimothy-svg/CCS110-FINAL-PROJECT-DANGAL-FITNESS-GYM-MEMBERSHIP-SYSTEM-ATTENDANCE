// Sort menu
function sortMenuItem(attrs, label, selected) {
  return `<li role="none"><button type="button" role="menuitemradio" aria-checked="${selected}"
            class="dropdown-item ${selected ? 'selected' : ''}" ${attrs}>
            <i class="bi bi-check-lg check" aria-hidden="true"></i>${label}</button></li>`;
}

function renderSortMenu() {
  const current = mod.sort.options.find(o => o[0] === sortKey) || [];
  const alphabetical = current[2] !== 'date';
  const ascText = alphabetical ? 'A to Z' : 'oldest first';
  const descText = alphabetical ? 'Z to A' : 'newest first';

  document.getElementById('sortMenu').innerHTML =
    mod.sort.options.map(([key, label]) => sortMenuItem(`data-sort="${key}"`, esc(label), key === sortKey)).join('')
    + '<li role="none"><hr class="dropdown-divider"></li>'
    + sortMenuItem('data-dir="asc"', `Ascending (${ascText})`, sortDir === 'asc')
    + sortMenuItem('data-dir="desc"', `Descending (${descText})`, sortDir === 'desc');

  document.getElementById('sortBtn').title =
    `Sorted by ${current[1] || ''}, ${sortDir === 'asc' ? ascText : descText}`;
}

function setupSort() {
  [sortKey, sortDir] = mod.sort.default;
  document.getElementById('sortCol').classList.remove('d-none');
  renderSortMenu();
  document.getElementById('sortMenu').addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button) return;
    if (button.dataset.sort) sortKey = button.dataset.sort;
    if (button.dataset.dir) sortDir = button.dataset.dir;
    renderSortMenu();
    loadRecords();
  });
}
