// Blocks data-changing requests from other websites (CSRF)
module.exports = function sameOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const origin = req.headers.origin;
  if (origin) {
    let host = null;
    try { host = new URL(origin).host; } catch (e) { /* invalid origin */ }
    if (host !== req.headers.host)
      return res.status(403).json({ error: 'Blocked: this request came from another website.' });
  }
  if (!String(req.headers['content-type'] || '').startsWith('application/json'))
    return res.status(415).json({ error: 'Requests must be sent as JSON.' });
  next();
};
