import { SQLQueryBindings } from 'bun:sqlite';
import { GeneralModuleResolver } from '#api/module/types.js';
import { Logger } from '#core/logger/logger.js';
import { dtoUtility } from '#core/utils/dto/dto-utility.js';
import { BunSqliteDatabase } from './database.js';
import { MigrateRow } from './types.js';
import { DatabaseServiceStatus } from '#api/database/types.js';
import { Repository } from '#api/database/repository.js';

export abstract class BunSqliteRepository<
  TN extends string, R extends Record<string, string | number | null>
> implements Repository<TN, R> {
  abstract tableName: TN;

  protected resolver!: GeneralModuleResolver;

  protected logger!: Logger;

  abstract migrationRows: MigrateRow[];

  /** Создать таблицу в БД */
  abstract create(): void

  constructor(protected db: BunSqliteDatabase) {}

  init(resolver: GeneralModuleResolver): void {
    this.resolver = resolver;
    this.logger = resolver.getLogger();
  }

  addBatch(records: R[]): void {
    if (records.length === 0) return;

    const colNames = dtoUtility.getUniqueKeys(records);

    const transaction = this.db.sqliteDb.transaction(() => {
      records.forEach((rec) => {
        const valueNames = colNames.map((nm) => (
          this.isObject(rec[nm]) ? `json($${nm})` : `$${nm}`
        ));
        const bindings = this.bindKeys(rec);

        const sql = `INSERT INTO ${this.tableName} (${colNames.join(',')}) VALUES (${valueNames.join(',')})`;
        this.db.sqliteDb.prepare(sql).run(bindings);
      });
    });
    transaction();
  }

  isCreated(): boolean {
    return this.db.getAllTableNames().includes(this.tableName);
  }

  /** Выполнить миграцию для репозитория */
  migrate(): void {
    const migrationRepo = this.db.getMigrationRepo();
    this.migrationRows.forEach((mRow) => {
      if (migrationRepo.rowIsMigrated(mRow.id) === false) {
        try {
          const transaction = this.db.sqliteDb.transaction(() => {
            this.migrateTable(mRow);
            migrationRepo.registerMigration(mRow, this.tableName);
          });
          transaction();
          this.logger.info(`---| migrate "${mRow.description}" successfully processed`);
        } catch (e) {
          throw this.logger.error(
            `fail migrate "${mRow.description}" row`,
            mRow,
            e as Error,
          );
        }
      }
    });
  }

  clear(): void {
    this.db.sqliteDb.run(`DELETE FROM ${this.tableName}`);
  }

  getMigrateStatus(): DatabaseServiceStatus | 'notRequired' {
    if (!this.isCreated()) return 'none';
    if (this.migrationRows.length === 0) return 'notRequired';
    const mRepo = this.db.getMigrationRepo();
    const rowsIsMigrated = this.migrationRows.map((mRow) => mRepo.rowIsMigrated(mRow.id));
    const allRowsMigrated = rowsIsMigrated.every((isMigrated) => isMigrated);
    if (allRowsMigrated) return 'complete';
    const allRowsNotMigrated = rowsIsMigrated.every((isMigrated) => !isMigrated);
    return allRowsNotMigrated ? 'none' : 'partial';
  }

  /** Возвращает объект приведенный для привязки */
  protected bindKeys(obj: Record<string, unknown>): SQLQueryBindings {
    return dtoUtility.editKeys(obj, (k) => `$${k}`);
  }

  protected isObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null;
  }

  protected migrateTable(migration: MigrateRow): void {
    this.db.sqliteDb.run(migration.sql);
  }
}
