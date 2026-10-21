// Input rules (shared by the browser and the server)
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();  // Node
  else root.Validators = factory();  // Browser
})(this, function () {

  const DAY = '(Mon|Tue|Wed|Thu|Fri|Sat|Sun)';
  const SCHEDULE = new RegExp('^' + DAY + '([/-]' + DAY + ')* (0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$', 'i');
  const BOOKING_DAYS_AHEAD = 30;

  // text: length + pattern | number: range
  const RULES = {
    name:      { kind: 'text', min: 2, max: 50, re: /^\p{L}+(?:[ '.\-]\p{L}+)*$/u,
                 msg: 'can only contain letters, spaces, apostrophes, hyphens and periods (no numbers or symbols).' },
    title:     { kind: 'text', min: 2, max: 80, re: /^[\p{L}\p{N}][\p{L}\p{N} &'.\-]*$/u,
                 msg: "can only contain letters, numbers, spaces and & ' . -" },
    email:     { kind: 'text', min: 5, max: 100, re: /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/,
                 msg: 'must be a valid email address (example: name@email.com).' },
    phone:     { kind: 'text', re: /^(09\d{9}|\+639\d{9})$/,
                 msg: 'must be a valid Philippine mobile number (example: 09171234567).' },
    username:  { kind: 'text', min: 3, max: 20, re: /^[A-Za-z0-9_]+$/,
                 msg: 'can only contain letters, numbers and underscores (no spaces).' },
    password:  { kind: 'text', min: 6, max: 50, re: /^\S+$/,
                 msg: 'cannot contain spaces.' },
    schedule:  { kind: 'text', max: 80, re: SCHEDULE,
                 msg: 'must look like "Mon/Wed/Fri 6:00 AM", "Tue/Thu 5:00 PM" or "Mon-Fri 7:00 AM".' },
    reference: { kind: 'text', min: 6, max: 20, re: /^[A-Za-z0-9]+$/,
                 msg: 'can only contain letters and numbers (no spaces or symbols).' },
    capacity:  { kind: 'number', min: 1, max: 100, integer: true },
    duration:  { kind: 'number', min: 1, max: 3650, integer: true },
    price:     { kind: 'number', min: 1, max: 100000, decimals: 2 },
    bookingDate: { kind: 'bookingDate' }
  };

  // Dates (YYYY-MM-DD)
  function pad(n) { return String(n).padStart(2, '0'); }
  function toDateString(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayString() { return toDateString(new Date()); }
  function addDays(dateString, days) {
    const [y, m, d] = dateString.split('-').map(Number);
    return toDateString(new Date(y, m - 1, d + days));
  }
  function isRealDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y, m, d] = s.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }
  function weekdayOf(s) {  // 0 = Sunday
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).getDay();
  }

  // "Mon/Wed/Fri 6:00 AM" -> [1,3,5]    "Mon-Fri 7:00 AM" -> [1,2,3,4,5]
  function scheduleDays(schedule) {
    const names = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const part = String(schedule || '').split(' ')[0].toLowerCase();
    if (!part) return [];
    if (part.includes('-') && !part.includes('/')) {
      const [from, to] = part.split('-').map(x => names.indexOf(x.slice(0, 3)));
      if (from < 0 || to < 0) return [];
      const days = [];
      for (let i = from; ; i = (i + 1) % 7) { days.push(i); if (i === to) break; }
      return days;
    }
    return part.split('/').map(x => names.indexOf(x.slice(0, 3))).filter(i => i >= 0);
  }

  // Check: '' when valid, otherwise the error message
  function check(ruleName, value, label) {
    const rule = RULES[ruleName];
    const text = String(value ?? '').trim();
    if (!rule || text === '') return '';

    if (rule.kind === 'text') {
      if (rule.min && text.length < rule.min || rule.max && text.length > rule.max) {
        return rule.min && rule.max
          ? `${label} must be ${rule.min} to ${rule.max} characters.`
          : `${label} must be at most ${rule.max} characters.`;
      }
      if (!rule.re.test(text)) return `${label} ${rule.msg}`;
      return '';
    }

    if (rule.kind === 'number') {
      if (!/^\d+(\.\d+)?$/.test(text)) return `${label} must be a number.`;
      const n = Number(text);
      if (rule.integer && !Number.isInteger(n)) return `${label} must be a whole number.`;
      if (rule.decimals && !new RegExp('^\\d+(\\.\\d{1,' + rule.decimals + '})?$').test(text))
        return `${label} can have at most ${rule.decimals} decimal places.`;
      if (n < rule.min || n > rule.max) return `${label} must be between ${rule.min} and ${rule.max}.`;
      return '';
    }

    if (rule.kind === 'bookingDate') {
      if (!isRealDate(text)) return `${label} must be a valid date.`;
      if (text < todayString()) return `${label} cannot be in the past.`;
      if (text > addDays(todayString(), BOOKING_DAYS_AHEAD))
        return `${label} must be within the next ${BOOKING_DAYS_AHEAD} days.`;
      return '';
    }
    return '';
  }

  return { RULES, check, todayString, addDays, isRealDate, weekdayOf, scheduleDays, BOOKING_DAYS_AHEAD };
});
