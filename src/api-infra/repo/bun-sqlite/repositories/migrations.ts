/* eslint-disable @typescript-eslint/no-empty-function */
import { dtoUtility } from '#core/utils/dto/dto-utility.js';
import { BunSqliteRepository } from '../repository.js';
import { MigrateRow } from '../types.js';

export class MigrationsSqliteRepository extends BunSqliteRepository<'migrations', MigrateRow> {
  tableName = 'migrations' as const;

  migrationRows: MigrateRow[] = [];

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

  rowIsMigrated(rowId: string): boolean {
    const query = this.db.sqliteDb.query(
      `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id=?) as count;`,
    );
    return !!((query.get(rowId) as {count: 1 | 0}).count);
  }

  registerMigration(migration: MigrateRow, tableName: string): void {
    const row = dtoUtility.extendAttrs(migration, { tableName });
    const migrationRecordSql = `
      INSERT INTO ${this.tableName}
      VALUES ($id, $description, $sql, $tableName, unixepoch('now'))
    `;
    this.db.sqliteDb.prepare(migrationRecordSql).run(this.getObjectBindings(row));
  }

  clear(): void {} // записи таблицы миграции не очищаются
}
