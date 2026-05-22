const b = require('bcryptjs');
const h = process.env.ADMIN_PASSWORD_HASH;
const e = process.env.ADMIN_EMAIL;
console.log('email:', e);
console.log('hash:', h);
console.log('hash_len:', h ? h.length : 0);
b.compare('SaadiLaw2026', h).then(r => {
  console.log('match:', r);
  process.exit(0);
}).catch(err => {
  console.log('bcrypt_error:', err.message);
  process.exit(1);
});
