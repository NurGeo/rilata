/* eslint-disable no-use-before-define */
import { Database as SqliteDb } from 'bun:sqlite';
import { existsSync } from 'fs';
import { TestRepository } from '#api/database/test.repository.js';
import { DatabaseServiceStatus, TestBatchRecords } from '#api/database/types.js';
import { GeneralModuleResolver } from '#api/module/types.js';
import { Logger } from '#core/logger/logger.js';
import { DTO } from '#domain/dto.js';
import { MigrationsSqliteRepository } from './repositories/migrations.js';
import { BunSqliteRepository } from './repository.js';
import { BunRepoCtor } from './types.js';
import { FullDatabase } from '#api/database/full.database.js';
import { MaybePromise } from '#core/types.js';
import { consoleColor } from '#core/utils/string/console-color.js';

const MEMORY_PATH = ':memory:';

export class BunSqliteDatabase implements FullDatabase {
  protected migrationRepo: MigrationsSqliteRepository;

  protected resolver!: GeneralModuleResolver;

  protected logger!: Logger;

  protected sqliteDbInstance: SqliteDb | undefined;

  get sqliteDb(): SqliteDb {
    if (this.sqliteDbInstance) return this.sqliteDbInstance;
    throw this.resolver.getLogger().error('database not opened');
  }

  protected repositories: BunSqliteRepository<string, DTO>[] = [];

  constructor(protected RepositoriesCtors: BunRepoCtor[]) {
    this.migrationRepo = new MigrationsSqliteRepository(this);
    this.repositories = RepositoriesCtors.map((Ctor) => new Ctor(this));
    // this.toColored = Boolean(process.env.TO_COLOR);
  }

  init(moduleResolver: GeneralModuleResolver): void {
    this.resolver = moduleResolver;
    this.logger = this.resolver.getLogger();
    this.migrationRepo.init(moduleResolver);
    this.repositories.forEach((repo) => repo.init(moduleResolver));
    if (this.getFullFileName() === MEMORY_PATH) {
      this.createDb();
    } else {
      // открытие файла приводит к создание файла БД
      // так что запуск в режиме prod, автоматически приводит к созданию файла
      // но он все еще требует физического создания таблиц и т.д.
      this.open();
    }
  }

  addRepository(repo: BunSqliteRepository<string, DTO>): void {
    this.repositories.push(repo);
  }

  /** Создать файл БД и таблицы. */
  createDb(): void {
    this.logger.info(`create db "${this.getFileName()}" for module: "${this.resolver.getModuleName()}" started`);
    this.openSqliteDb();
    if (this.creationStatus() !== 'none') {
      throw this.logger.error(`database ${this.getFileName()} for module: ${this.resolver.getModuleName()} has already been created.`);
    }
    this.createRepositories();
    this.migrateDb();
    this.logger.info(`create db "${this.getFileName()}" for module: "${this.resolver.getModuleName()}" finished`);
  }

  async getStatusAsString(needPaint?: boolean): Promise<string> {
    const toBright = (s: string): string => (needPaint ? consoleColor.bright(s) : s);
    const toColor = (s: string): string => (
      needPaint
        ? ['complete', 'notRequired', 'true'].includes(s)
          ? consoleColor.fgColor(s, 'Green')
          : consoleColor.fgColor(s, 'Red')
        : s
    );

    const dbName = toBright(`module name: ${(this.resolver.getModuleName())}`);
    const dbCreateStatus = `db creation status = ${toColor(this.creationStatus())}`;
    const dbMigrateStatus = `db migration status = ${toColor(await this.migrationStatus())}`;
    const dbRepositoriesStatuses = `db repositories:\n${
      this.getAllRepositories()
        .map((repo) => ({
          name: toBright(repo.tableName),
          isCreated: toColor(String(repo.isCreated())),
          migrationStatus: toColor(repo.getMigrateStatus()),
        }))
        .map((rec) => `  repo name: ${rec.name}\n    repo is created = ${rec.isCreated}\n    repo migrate status = ${rec.migrationStatus}`)
        .join('\n')
    }`;
    return `${dbName}\n${dbCreateStatus}\n${dbMigrateStatus}\n${dbRepositoriesStatuses}`;
  }

  creationStatus(): DatabaseServiceStatus {
    const repoCreations = this.getAllRepositories().map((r) => r.isCreated());
    const allCreated = repoCreations.every((repoCreated) => repoCreated);
    if (allCreated) return 'complete';
    const noneHaveBeenCreated = repoCreations.every((repoCreated) => !repoCreated);
    return noneHaveBeenCreated ? 'none' : 'partial';
  }

  migrateDb(): MaybePromise<void> {
    this.getAllRepositories().forEach((repo) => {
      this.logger.info(`-| migrate for repo: "${repo.tableName}" started`);
      repo.migrate();
      this.logger.info(`-| migrate for repo: "${repo.tableName}" finished`);
    });
  }

  migrationStatus(): MaybePromise<DatabaseServiceStatus> {
    const repoMigrateStatuses = this.getAllRepositories().map((r) => r.getMigrateStatus());
    const allMigrated = repoMigrateStatuses.every((status) => ['complete', 'notRequired'].includes(status));
    if (allMigrated) return 'complete';
    const allReposNotMigrated = repoMigrateStatuses.every((status) => status === 'none');
    return allReposNotMigrated ? 'none' : 'partial';
  }

  getAllTableNames(): string[] {
    const sql = "SELECT name FROM sqlite_master WHERE type='table'";
    const tables = this.sqliteDb.query<{ name: string }, []>(sql).all();
    return tables.map((tbl) => tbl.name);
  }

  getMigrationRepo(): MigrationsSqliteRepository {
    return this.migrationRepo;
  }

  open(): void {
    this.openSqliteDb();
  }

  getRepository<R extends BunSqliteRepository<string, DTO>>(name: R['tableName']): R {
    const repo = this.repositories.find((r) => r.tableName === name);
    if (!repo) {
      throw this.resolver.getLogger().error(
        `cannot finded repository by name: "${name}"`,
      );
    }
    return repo as R;
  }

  addBatch<R extends TestRepository<string, DTO>>(
    batchRecords: TestBatchRecords<R>,
  ): void {
    Object.entries(batchRecords).map(([tableName, records]) => {
      const repo = this.getRepository(tableName);
      return repo.addBatch(records as DTO[]);
    });
  }

  clearDb(): void {
    const transaction = this.sqliteDb.transaction(() => {
      this.getAllRepositories().forEach((repo) => repo.clear());
    });
    transaction();
    this.logger.info(`sqlite db for module "${this.resolver.getModuleName()}" cleared`);
  }

  getFileName(): string {
    return '.sqlite';
  }

  getFilePath(): string {
    return this.resolver.getModulePath(); // default: path to module dir
  }

  getFullFileName(): string {
    return this.resolver.getServerResolver().getRunMode() !== 'prod'
      ? MEMORY_PATH
      : `${this.getFilePath()}/${this.getFileName()}`;
  }

  stop(): void {
    this.sqliteDb?.close();
  }

  protected getAllRepositories(): BunSqliteRepository<string, DTO>[] {
    return [this.migrationRepo, ...this.repositories];
  }

  protected createRepositories(): void {
    this.migrationRepo.create();
    this.repositories.forEach((repo) => {
      repo.create();
      this.logger.info(`-| repo: "${repo.tableName}" successfully created`);
    });
  }

  protected openSqliteDb(): void {
    if (!this.sqliteDbInstance) {
      this.sqliteDbInstance = new SqliteDb(this.getFullFileName());
      this.logger.info(`-| sqlite db by name "${this.getFileName()}" for module "${this.resolver.getModuleName()}" opened`);
    }
  }

  protected dbFileIsExist(): boolean {
    return existsSync(this.getFullFileName());
  }
}
