import { randomBytes, scryptSync } from 'node:crypto';
let password = '';
process.stderr.write('Masukkan password melalui stdin (minimal 12 karakter), lalu akhiri input.\n');
for await (const chunk of process.stdin) password += chunk;
password = password.replace(/\r?\n$/, '');
if (password.length < 12 || password.length > 1024) throw new Error('Gunakan 12–1024 karakter.');
const salt = randomBytes(16).toString('hex');
console.log(`ADMIN_PASSWORD_HASH=${salt}:${scryptSync(password,salt,64).toString('hex')}`);
