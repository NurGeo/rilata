import { SQLQueryBindings } from 'bun:sqlite';
import { TestRepository } from '#api/database/test.repository.js';
import { GeneralModuleResolver } from '#api/module/types.js';
import { Logger } from '#core/logger/logger.js';
import { dtoUtility } from '#core/utils/dto/dto-utility.js';
import { DTO } from '#domain/dto.js';
import { BunSqliteDatabase } from './database.js';
import { MigrateRow } from './types.js';

export abstract class BunSqliteRepository<
  TN extends string, R extends DTO
> implements TestRepository<TN, R, false> {
  abstract tableName: TN;

  protected resolver!: GeneralModuleResolver;

  protected logger!: Logger;

  abstract migrationWRows: MigrateRow[];

  /** Создать таблицу в БД */
  abstract create(): void

  constructor(protected db: BunSqliteDatabase) {}

  clear(): void {
    this.db.sqliteDb.run(`DELETE FROM ${this.tableName}`);
  }

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
        const bindings = this.getObjectBindings(rec);

        const sql = `INSERT INTO ${this.tableName} (${colNames.join(',')}) VALUES (${valueNames.join(',')})`;
        this.db.sqliteDb.prepare(sql).run(bindings);
      });
    });
    transaction();
  }

  /** Возвращает объект приведенный для привязки */
  protected getObjectBindings(obj: Record<string, unknown>): SQLQueryBindings {
    const casted = dtoUtility.editValues(obj, (v) => (this.isObject(v) ? JSON.stringify(v) : v));
    return dtoUtility.editKeys(casted, (k) => `$${k}`);
  }

  protected isObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null;
  }

  /** Выполнить миграцию для репозитория */
  migrate(): void {
    this.migrationWRows.forEach((migration) => {
      const migrTblName = this.db.migrationRepo.tableName;
      const query = this.db.sqliteDb.query(
        `SELECT * FROM ${migrTblName} WHERE id=?`,
      );
      const rowIsMigrated = query.get(migration.id);
      if (!rowIsMigrated) {
        try {
          const transation = this.db.sqliteDb.transaction(() => {
            this.db.sqliteDb.run(migration.sql);
            this.db.sqliteDb.run(this.getMigrationSql(migration));
          });
          transation();
          this.logger.info(`---| migrate "${migration.description}" successfully processed`);
        } catch (e) {
          throw this.logger.error(
            `fail migrate "${migration.description}" row`,
            migration,
            e as Error,
          );
        }
      }
    });
  }

  protected getMigrationSql(migration: MigrateRow): string {
    const { id, description, sql } = migration;
    return `INSERT INTO migrations VALUES ('${id}', '${description}', '${sql}', '${this.tableName}', unixepoch('now'))`;
  }
}
