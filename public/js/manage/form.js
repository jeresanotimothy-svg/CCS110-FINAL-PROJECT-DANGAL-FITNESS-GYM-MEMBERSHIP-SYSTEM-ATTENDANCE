// Form (add / edit / reset password)
const formModal = new bootstrap.Modal(document.getElementById('formModal'));

async function loadChoices() {
  for (const f of mod.fields) {
    if (f.from && !choices[f.from]) choices[f.from] = await api('/api/lookup/' + f.from);
  }
}

function showFormError(text) {
  const box = document.getElementById('formError');
  box.textContent = text;
  box.classList.remove('d-none');
}

// Field HTML
function selectHtml(f, value, attrs) {
  let html = `<select ${attrs} class="form-select"><option value="">-- Select --</option>`;
  if (f.options) {
    html += f.options.map(o => `<option ${o === value ? 'selected' : ''}>${o}</option>`).join('');
  } else {
    html += (choices[f.from] || [])
      .filter(c => !f.onlyStatus || c.status === f.onlyStatus)
      .map(c => {
        const label = esc(f.text.map(t => c[t]).join(f.joiner || ' '));
        return `<option value="${c[f.value]}" ${String(c[f.value]) === String(value) ? 'selected' : ''}>${label}</option>`;
      }).join('');
  }
  return html + '</select>';
}

function inputAttributes(f) {
  const rule = Validators.RULES[f.rule] || {};
  const today = Validators.todayString();
  let extra = '';
  if (f.type === 'date' && f.dateRange)
    extra = `min="${today}" max="${Validators.addDays(today, Validators.BOOKING_DAYS_AHEAD)}"`;
  if (f.type === 'number')
    extra = `min="${f.min ?? 0}" ${f.max !== undefined ? `max="${f.max}"` : ''} step="${rule.integer ? 1 : 0.01}"`;
  if (rule.max && f.type !== 'number') extra += ` maxlength="${rule.max}"`;
  if (f.type === 'tel') extra += ' inputmode="tel"';
  if (f.readonly) extra += ' readonly';
  return extra;
}

function controlHtml(f, value) {
  const attrs = `id="f_${f.name}" aria-describedby="h_${f.name} e_${f.name}" ${f.required ? 'aria-required="true"' : ''}`;
  if (f.type === 'select') return selectHtml(f, value, attrs);
  const autocomplete = f.type === 'password' ? 'new-password' : 'off';
  return `<input ${attrs} type="${f.type}" class="form-control" value="${esc(value)}" autocomplete="${autocomplete}" ${inputAttributes(f)}>`;
}

function fieldHtml(f, value) {
  const star = f.required || f.requiredWhenShown ? ' *' : '';
  const hint = f.hint ? `<div class="form-text" id="h_${f.name}">${esc(f.hint)}</div>` : `<div id="h_${f.name}"></div>`;
  return `<div class="col-md-6" id="g_${f.name}">
      <label class="form-label" for="f_${f.name}">${f.label}${star}</label>
      ${controlHtml(f, value)}
      ${hint}
      <div class="invalid-feedback" id="e_${f.name}"></div>
    </div>`;
}

// Validation
function fieldError(f) {
  if (document.getElementById('g_' + f.name).classList.contains('d-none')) return '';
  const value = document.getElementById('f_' + f.name).value.trim();
  if ((f.required || f.requiredWhenShown) && value === '') return f.label + ' is required.';
  if (value !== '' && f.rule) return Validators.check(f.rule, value, f.label);
  return '';
}

function showFieldError(f) {
  const message = fieldError(f);
  const el = document.getElementById('f_' + f.name);
  el.classList.toggle('is-invalid', message !== '');
  el.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
  document.getElementById('e_' + f.name).textContent = message;
  return message;
}

// Field behaviour
function attachFieldEvents(f) {
  const el = document.getElementById('f_' + f.name);
  if (INPUT_FILTERS[f.rule])
    el.addEventListener('input', () => { el.value = el.value.replace(INPUT_FILTERS[f.rule], ''); });
  el.addEventListener('blur', () => showFieldError(f));
  el.addEventListener('input', () => { if (el.classList.contains('is-invalid')) showFieldError(f); });
  el.addEventListener('change', () => showFieldError(f));
}

function setupAutoFill(fields) {
  fields.filter(f => f.fillFrom).forEach(f => {
    const source = document.getElementById('f_' + f.fillFrom.field);
    source.addEventListener('change', () => {
      const item = (choices[f.fillFrom.source] || []).find(c => String(c[f.fillFrom.field]) === source.value);
      document.getElementById('f_' + f.name).value = item ? item[f.fillFrom.key] : '';
      showFieldError(f);
    });
  });
}

function setupShowWhen(fields) {
  const dependent = fields.filter(f => f.showWhen);
  const refresh = () => dependent.forEach(f => {
    const show = f.showWhen.values.includes(document.getElementById('f_' + f.showWhen.field).value);
    document.getElementById('g_' + f.name).classList.toggle('d-none', !show);
    if (!show) document.getElementById('f_' + f.name).value = '';
  });
  dependent.forEach(f => document.getElementById('f_' + f.showWhen.field).addEventListener('change', refresh));
  refresh();
}

function buildForm(values, fields = mod.fields) {
  currentFields = fields;
  document.getElementById('formFields').innerHTML =
    '<div class="row g-3">' + fields.map(f => fieldHtml(f, values[f.name] ?? '')).join('') + '</div>';
  document.getElementById('formError').classList.add('d-none');
  fields.forEach(attachFieldEvents);
  setupAutoFill(fields);
  setupShowWhen(fields);
}

// Open
function formTitle(prefix) {
  document.getElementById('modalTitle').textContent = prefix + ' ' + mod.title.replace(/s$/, '');
}

function openAdd() {
  editingId = null;
  resetId = null;
  formTitle('Add');
  const defaults = {};
  mod.fields.forEach(f => { if (f.name === 'status') defaults.status = 'Active'; });
  buildForm(defaults);
  formModal.show();
}

async function openEdit(index) {
  await loadChoices();
  const row = records[index];
  editingId = row[mod.pk];
  resetId = null;
  formTitle('Edit');
  buildForm(row);
  formModal.show();
}

function openReset(index) {
  const row = records[index];
  resetId = row.user_id;
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Reset Password: ' + row.username;
  buildForm({}, [mod.resetField]);
  formModal.show();
}

// Save
function readForm() {
  const body = {};
  let firstInvalid = null;
  currentFields.forEach(f => {
    if (showFieldError(f) && !firstInvalid) firstInvalid = f;
    body[f.name] = document.getElementById('f_' + f.name).value.trim();
  });
  return { body, firstInvalid };
}

async function sendForm(body) {
  if (resetId !== null) {
    await api(`/api/users/${resetId}/password`, 'PATCH', body);
    return 'Password reset.';
  }
  if (editingId === null) {
    await api(`/api/${moduleName}`, 'POST', body);
    return 'Record added.';
  }
  await api(`/api/${moduleName}/${editingId}`, 'PUT', body);
  return 'Record updated.';
}

async function saveRecord() {
  const { body, firstInvalid } = readForm();
  if (firstInvalid) {
    showFormError('Please fix the highlighted fields.');
    document.getElementById('f_' + firstInvalid.name).focus();
    return;
  }
  try {
    const message = await sendForm(body);
    formModal.hide();
    showMessage(message, 'success');
    loadRecords();
  } catch (err) {
    showFormError(err.message);
  }
}
