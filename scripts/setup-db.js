// Creates the tables and sample data in an online database (run once)
//   npm run setup-db                 uses .env
//   npm run setup-db -- .env.aiven   uses another settings file
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: process.argv[2] || '.env' });
const mysql = require('mysql2/promise');
const { connectionOptions } = require('../config/dbOptions');
const { logError, loginMessage } = require('../utils/dbError');

async function main() {
  if (process.env.DB_PASSWORD === undefined) throw new Error('DB_PASSWORD is missing in the settings file.');
  const options = connectionOptions();
  const connection = await mysql.createConnection({ ...options, multipleStatements: true });

  const [existing] = await connection.query("SHOW TABLES LIKE 'users'");
  if (existing.length > 0) {
    console.log('The tables already exist in "' + options.database + '". Nothing was changed.');
    await connection.end();
    return;
  }

  // The tables are created in the database named in DB_NAME (for example defaultdb on Aiven)
  const file = path.join(__dirname, '..', 'database', 'gym_db_cloud.sql');
  const sql = fs.readFileSync(file, 'utf8')
    .replace(/^CREATE DATABASE IF NOT EXISTS .*;\s*$/m, '')
    .replace(/^USE .*;\s*$/m, '');
  await connection.query(sql);
  console.log('Done: tables and sample data created in "' + options.database + '" on ' + options.host + '.');
  await connection.end();
}

main().catch(e => {
  logError(e);
  console.error(loginMessage(e));
  process.exit(1);
});
