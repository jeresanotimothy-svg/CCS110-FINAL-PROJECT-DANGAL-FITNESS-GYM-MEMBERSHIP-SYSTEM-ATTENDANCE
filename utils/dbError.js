// Database error helpers

// Print the real reason in the terminal (or the Render logs)
function logError(e) {
  console.error('Database error:', e.code || '', e.message);
}

// Short hint for the login page (details only while developing)
function loginMessage(e) {
  if (process.env.NODE_ENV === 'production') return 'The system cannot reach its database right now. Please try again later.';
  switch (e.code) {
    case 'ER_ACCESS_DENIED_ERROR': return 'Database login failed. Check DB_USER and DB_PASSWORD in .env, and that MySQL has the same password.';
    case 'ER_BAD_DB_ERROR': return 'Database not found. Check DB_NAME and import database/gym_db.sql.';
    case 'ER_NO_SUCH_TABLE':
    case 'ER_BAD_FIELD_ERROR': return 'The database tables are out of date. Import database/gym_db.sql again.';
    case 'SELF_SIGNED_CERT_IN_CHAIN':
    case 'DEPTH_ZERO_SELF_SIGNED_CERT':
    case 'UNABLE_TO_VERIFY_LEAF_SIGNATURE': return 'The database certificate was not accepted. Set DB_SSL_CA_FILE to the CA certificate (certs/ca.pem) from the Aiven service page.';
    default: return 'Cannot reach the database. Is MySQL running, and are DB_HOST, DB_PORT and DB_SSL correct?';
  }
}

module.exports = { logError, loginMessage };
