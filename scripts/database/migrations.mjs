import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { DatabaseError } from '../../lib/admin/postgres.mjs';
const migrationUrl = new URL('../../migrations/001_neon.sql', import.meta.url);
export const migrationSql = readFileSync(migrationUrl, 'utf8');
export const migrationChecksum = createHash('sha256').update(migrationSql).digest('hex');
export async function applyMigrations(client) {
 await client.query('BEGIN');
 try {
  await client.query('SELECT pg_advisory_xact_lock(824101)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
  const existing=(await client.query('SELECT checksum FROM schema_migrations WHERE version=1')).rows[0];
  if(existing&&existing.checksum!==migrationChecksum)throw new DatabaseError('Checksum migrasi berbeda. Hentikan dan tinjau schema; jangan menimpa migrasi yang sudah diterapkan.');
  if(!existing){await client.query(migrationSql);await client.query('INSERT INTO schema_migrations(version,checksum) VALUES(1,$1)',[migrationChecksum]);}
  await client.query('COMMIT');
  return {version:1,applied:!existing};
 }catch(error){await client.query('ROLLBACK');throw error;}
}
export async function checkSchema(client) {
 const result=await client.query('SELECT checksum FROM schema_migrations WHERE version=1');
 if(result.rows[0]?.checksum!==migrationChecksum)throw new DatabaseError('Schema belum sesuai. Jalankan atau tinjau migrasi sebelum melanjutkan.');
}
