// Database connection settings (from .env locally, or Environment variables on Render)
const fs = require('fs');
const path = require('path');

// Encrypted connection for cloud databases (Aiven, TiDB Cloud): DB_SSL=true
function sslOptions() {
  if (process.env.DB_SSL !== 'true') return undefined;
  const options = { minVersion: 'TLSv1.2', rejectUnauthorized: true };

  // CA certificate: downloaded from the Aiven service page (certs/ca.pem) or pasted in DB_SSL_CA
  if (process.env.DB_SSL_CA_FILE) {
    const file = path.resolve(process.env.DB_SSL_CA_FILE);
    if (fs.existsSync(file)) options.ca = fs.readFileSync(file, 'utf8');
    else console.warn('Warning: CA file not found: ' + file);
  } else if (process.env.DB_SSL_CA) {
    options.ca = process.env.DB_SSL_CA.replace(/\\n/g, '\n');
  }
  return options;
}

// Time zone for NOW() and CURDATE()
function timeZone() {
  return /^[+-]\d{2}:\d{2}$/.test(process.env.DB_TIMEZONE || '') ? process.env.DB_TIMEZONE : '+08:00';
}

function connectionOptions() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'gym_db',
    ssl: sslOptions(),
    dateStrings: true,
    connectTimeout: 15000
  };
}

module.exports = { connectionOptions, timeZone };
