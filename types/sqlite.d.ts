declare module "node:sqlite" {
 export class DatabaseSync {
  constructor(path: string);
  exec(sql: string): void;
  prepare(sql: string): { run(...args: (string | number | null)[]): { changes: number }; get(...args: (string | number | null)[]): unknown; all(...args: (string | number | null)[]): unknown[] };
 }
}
