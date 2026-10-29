// Native SQLite is used only by offline backup/import tooling and source fixtures.
declare module 'node:sqlite' {
 export class DatabaseSync {
  constructor(path:string,options?:{readOnly?:boolean});
  exec(sql:string):void;
  close():void;
  prepare(sql:string):{run(...args:(string|number|null)[]):{changes:number};get(...args:(string|number|null)[]):unknown;all(...args:(string|number|null)[]):unknown[]};
 }
 export function backup(source:DatabaseSync,path:string):Promise<number>;
}
