import pg from 'pg';

export class DatabaseError extends Error {
  constructor(message = 'Basis data belum dapat dihubungi. Coba lagi atau hubungi pengelola.') {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Never forward driver messages, SQL, parameters, connection URLs, or causes.
export function safeDatabaseError(error) {
  if (error instanceof DatabaseError) return error;
  const code = error && typeof error === 'object' && typeof error.code === 'string' && /^[A-Z0-9]{5}$/.test(error.code) ? error.code : 'CONNECTION';
  if (code === '23505' && error.constraint === 'daily_sales_duplicate') {
    return new DatabaseError('Rekap penjualan tanggal ini sudah ada. Buka rekap yang ada untuk mengedit nominalnya.');
  }
  console.error('[admin-database]', { code });
  return new DatabaseError(code === '42P01' ? 'Basis data belum siap. Pengelola perlu menjalankan migrasi schema.' : undefined);
}

export function poolOptions(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new DatabaseError('DATABASE_URL belum dikonfigurasi. Hubungkan database Neon pada server.');
  let url;
  try { url = new URL(connectionString.trim()); } catch { throw new DatabaseError('Konfigurasi database tidak valid. Periksa pengaturan server.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username || !url.pathname.slice(1)) throw new DatabaseError('Konfigurasi database tidak valid. Periksa pengaturan server.');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
  const mode = url.searchParams.get('sslmode');
  if ((!local && mode === 'disable') || ['sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat'].some(key => url.searchParams.has(key))) throw new DatabaseError('Koneksi database harus menggunakan TLS yang terverifikasi.');
  // Explicit TLS verification; URL sslmode must not override rejectUnauthorized.
  url.searchParams.delete('sslmode');
  url.searchParams.delete('ssl');
  return { connectionString: url.toString(), ssl: local && mode === 'disable' ? false : { rejectUnauthorized: true }, max: 2, idleTimeoutMillis: 5000, connectionTimeoutMillis: 10000, query_timeout: 20000, application_name: 'altomebay-admin' };
}

export function createPostgresPool(connectionString) {
  const pool = new pg.Pool(poolOptions(connectionString));
  pool.on('error', error => { safeDatabaseError(error); });
  return pool;
}

// PostgreSQL BIGINT uses strings by default. Convert only known safe numeric fields.
export function normalizeRows(rows) {
  return rows.map(row => {
    const result = { ...row };
    for (const key of ['amount', 'expires', 'reset', 'failures']) {
      if (result[key] !== undefined && result[key] !== null) {
        const number = Number(result[key]);
        if (!Number.isSafeInteger(number)) throw new DatabaseError('Nilai database berada di luar batas yang didukung.');
        result[key] = number;
      }
    }
    return result;
  });
}

export function connectionTarget(connectionString) {
  const url = new URL(poolOptions(connectionString).connectionString);
  return url.hostname.replace('-pooler', '') + url.pathname;
}
