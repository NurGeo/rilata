/* eslint-disable @typescript-eslint/no-empty-function */
import { BunSqliteRepository } from '../repository.js';
import { MigrateRow } from '../types.js';

export class MigrationsSqliteRepository extends BunSqliteRepository<'migrations', MigrateRow> {
  tableName = 'migrations' as const;

  migrationWRows: MigrateRow[] = [];

  create(): void {
    this.db.sqliteDb.run(
      `CREATE TABLE ${this.tableName} (
        id TEXT PRIMARY KEY NOT NULL,
        description TEXT NOT NULL,
        sql TEXT NOT NULL,
        tableName TEXT NOT NULL,
        migratedAt INTEGER NOT NULL
      );`,
    );
  }

  clear(): void {} // записи таблицы миграции не очищаются
}
