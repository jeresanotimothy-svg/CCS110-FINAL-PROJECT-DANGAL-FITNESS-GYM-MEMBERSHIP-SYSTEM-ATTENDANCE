function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function api(url, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (res.status === 401) { window.location.href = 'login.html'; return; }
  let data = {};
  try { data = await res.json(); } catch (e) { /* no JSON body */ }
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

// Status badge
function badge(text, kind) {
  const cls = 'status-' + String(kind || text).toLowerCase();
  return `<span class="badge ${cls}">${esc(text)}</span>`;
}

// Pop-up messages (time shown in milliseconds)
const TOAST_TIME = { success: 2000, info: 3500, warning: 5000, danger: 6000 };
const TOAST_ICON = { success: 'bi-check-circle-fill', info: 'bi-info-circle-fill', warning: 'bi-exclamation-triangle-fill', danger: 'bi-x-octagon-fill' };

function showToast(text, type = 'success') {
  let area = document.getElementById('toastArea');
  if (!area) {
    area = document.createElement('div');
    area.id = 'toastArea';
    area.className = 'toast-container position-fixed end-0 p-3';
    document.body.appendChild(area);
  }
  const toast = document.createElement('div');
  toast.className = 'toast app-toast toast-' + type;
  toast.setAttribute('role', type === 'danger' || type === 'warning' ? 'alert' : 'status');
  toast.setAttribute('aria-live', type === 'danger' || type === 'warning' ? 'assertive' : 'polite');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `<div class="d-flex align-items-center">
      <i class="bi ${TOAST_ICON[type] || TOAST_ICON.info} toast-icon" aria-hidden="true"></i>
      <div class="toast-body">${esc(text)}</div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;
  area.appendChild(toast);
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
  new bootstrap.Toast(toast, { delay: TOAST_TIME[type] || 3000 }).show();
}

// Menu: [link, label, icon, roles]
const NAV_GROUPS = [
  { title: 'Overview', links: [
    ['index.html', 'Dashboard', 'bi-speedometer2', 'all']
  ]},
  { title: 'Gym', links: [
    ['manage.html?m=members', 'Members', 'bi-people', 'all'],
    ['manage.html?m=attendance', 'Attendance', 'bi-calendar-check', 'all'],
    ['manage.html?m=payments', 'Payments', 'bi-cash-coin', 'all'],
    ['manage.html?m=enrollments', 'Class Bookings', 'bi-journal-check', 'all'],
    ['manage.html?m=plans', 'Plans', 'bi-card-checklist', ['Admin']]
  ]},
  { title: 'Training', links: [
    ['manage.html?m=trainers', 'Trainers', 'bi-person-badge', ['Admin']],
    ['manage.html?m=classes', 'Classes', 'bi-calendar-event', ['Admin']]
  ]},
  { title: 'Admin', links: [
    ['manage.html?m=users', 'User Accounts', 'bi-shield-lock', ['Admin']]
  ]}
];

function canSee(roles, user) { return roles === 'all' || roles.includes(user.role); }

async function loadNavbar() {
  const user = await api('/api/auth/me');
  window.currentUser = user;
  const current = window.location.pathname.split('/').pop() + window.location.search;

  if (!document.getElementById('bi-css')) {
    const link = document.createElement('link');
    link.id = 'bi-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
    document.head.appendChild(link);
  }

  let menu = '';
  NAV_GROUPS.forEach(group => {
    const visible = group.links.filter(l => canSee(l[3], user));
    if (visible.length === 0) return;
    menu += `<div class="sidebar-title">${group.title}</div>`;
    visible.forEach(([href, label, icon]) => {
      const active = (current === href || (current === '' && href === 'index.html')) ? 'active' : '';
      const here = active ? ' aria-current="page"' : '';
      menu += `<a class="sidebar-link ${active}" href="${href}"${here}><i class="bi ${icon}" aria-hidden="true"></i><span>${label}</span></a>`;
    });
  });

  document.body.classList.add('has-sidebar');
  document.getElementById('navbar').innerHTML = `
    <header class="app-header">
      <button class="btn btn-outline-light btn-sm d-lg-none me-2" id="menuBtn" aria-label="Open menu" aria-controls="sidebar"><i class="bi bi-list" aria-hidden="true"></i></button>
      <a class="app-brand" href="index.html"><i class="bi bi-lightning-charge-fill" aria-hidden="true"></i><span>DANGAL <span class="brand-light">FITNESS</span></span></a>
      <div class="ms-auto d-flex align-items-center gap-2">
        <span class="app-user d-none d-sm-inline">${esc(user.username)}</span>
        <span class="role-pill d-none d-sm-inline">${esc(user.role)}</span>
        <button class="btn btn-outline-light btn-sm" data-theme-toggle type="button"><i class="bi bi-circle-half" aria-hidden="true"></i><span class="d-none d-md-inline" data-theme-label></span></button>
        <button class="btn btn-outline-light btn-sm" id="logoutBtn" type="button"><i class="bi bi-box-arrow-right" aria-hidden="true"></i><span class="d-none d-md-inline">Log Out</span></button>
      </div>
    </header>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <aside class="sidebar" id="sidebar" aria-label="Main menu">
      <nav class="sidebar-menu">${menu}</nav>
    </aside>`;
  if (window.refreshThemeButtons) window.refreshThemeButtons();

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = open => {
    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
  };
  document.getElementById('menuBtn').addEventListener('click', () => toggle(true));
  overlay.addEventListener('click', () => toggle(false));

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await api('/api/auth/logout', 'POST');
    window.location.href = 'login.html';
  });
}
