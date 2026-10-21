function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid data was sent.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'The data sent is too large.' });
  console.error(err.message);
  res.status(500).json({ error: 'Server error. Please try again.' });
}

module.exports = errorHandler;
