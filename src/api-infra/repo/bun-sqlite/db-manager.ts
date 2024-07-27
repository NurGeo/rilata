import { DatabaseManager } from '#api/database/db-manager.js';
import { SqlMethod } from '#api/database/types.js';
import { MaybePromise } from '#core/types.js';
import { BunSqliteDatabase } from './database.ts';

export class BunSqliteDatabaseManager extends DatabaseManager {
  sql<R>(moduleName: string, sql: string, method: SqlMethod): MaybePromise<R | undefined> {
    const dbRows = this.getDbServiceRows([moduleName]);
    if (dbRows.length === 0) {
      this.output(`Не найден модуль с именем: ${this.toGreen(moduleName)}`);
      return undefined;
    }
    const db = (dbRows[0].db as BunSqliteDatabase).sqliteDb;
    return db.query(sql)[method]() as R;
  }
}
