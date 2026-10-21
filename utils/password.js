// Password hashing (scrypt with a random salt)
const crypto = require('crypto');
const { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

const KEY_LENGTH = 64;

async function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = (await scrypt(plain, salt, KEY_LENGTH)).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

async function verifyPassword(plain, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const expected = Buffer.from(parts[2], 'hex');
  const actual = await scrypt(plain, parts[1], expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// For unknown usernames
const DUMMY_HASH = 'scrypt$00000000000000000000000000000000$' + '0'.repeat(128);

module.exports = { hashPassword, verifyPassword, DUMMY_HASH };
