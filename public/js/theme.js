// Light / Dark mode (saved in the browser, loaded in <head>)
(function () {
  var KEY = 'dangal_theme';

  function savedTheme() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function firstTheme() {
    var saved = savedTheme();
    if (saved === 'light' || saved === 'dark') return saved;
    var wantsLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    return wantsLight ? 'light' : 'dark';
  }

  window.refreshThemeButtons = function () {
    var dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
      var label = btn.querySelector('[data-theme-label]');
      if (label) label.textContent = dark ? 'Light mode' : 'Dark mode';
    });
  };

  window.setTheme = function (theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) { /* private mode: still works for this visit */ }
    window.refreshThemeButtons();
  };

  document.documentElement.setAttribute('data-bs-theme', firstTheme());

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-theme-toggle]')) {
      var dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
      window.setTheme(dark ? 'light' : 'dark');
    }
  });
  document.addEventListener('DOMContentLoaded', window.refreshThemeButtons);
})();
