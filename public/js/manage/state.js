// Page state
const params = new URLSearchParams(window.location.search);
const moduleName = params.get('m') || 'members';
const mod = MODULES[moduleName];

let records = [];
let boardMembers = [];
let choices = {};
let editingId = null;
let resetId = null;
let currentFields = [];
let sortKey = null;
let sortDir = 'desc';

// Characters removed while typing
const INPUT_FILTERS = {
  name: /[^\p{L} '.\-]/gu,
  phone: /[^\d+]/g,
  reference: /[^A-Za-z0-9]/g,
  username: /[^A-Za-z0-9_]/g
};

function can(roles) {
  return roles === 'all' || (Array.isArray(roles) && roles.includes(window.currentUser.role));
}

function showMessage(text, type) {
  showToast(text, type);
}
