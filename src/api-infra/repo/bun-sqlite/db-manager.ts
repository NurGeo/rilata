import { DatabaseServiceManager } from '#api/database/db-service-manager.js';
import { SqlMethod } from '#api/database/types.js';
import { MaybePromise } from '#core/types.js';
import { BunSqliteDatabase } from './database.ts';

export class BunSqliteDatabaseManager extends DatabaseServiceManager {
  sql<R>(moduleName: string, sql: string, method: SqlMethod): MaybePromise<R | undefined> {
    try {
      const dbRows = this.getDbServiceRows([moduleName]);
      if (dbRows.length === 0) {
        this.output(`Не найден модуль с именем: ${this.toGreen(moduleName)}`);
        return undefined;
      }
      const db = (dbRows[0].db as BunSqliteDatabase).sqliteDb;
      return db.query(sql)[method]() as R;
    } catch (e) {
      this.output(`\nОшибка при выполнении sql запроса: ${this.toGreen(sql)}. ${this.toRed((e as Error).message)}\n`);
      throw e;
    }
  }
}
