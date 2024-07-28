/* eslint-disable no-await-in-loop */
import { Module } from '#api/module/module.js';
import { MaybePromise } from '#core/types.js';
import { consoleColor } from '#core/utils/string/console-color.js';
import { Database } from './database.ts';
import { Args, DatabaseServiceRow, SqlMethod } from './types.ts';

export abstract class DatabaseServiceManager {
  private modules: Module[];

  constructor(modules: Module[]) {
    this.modules = modules;
  }

  abstract sql<R>(moduleName: string, sql: string, method: SqlMethod): MaybePromise<R | undefined>

  async run(): Promise<void> {
    const args = this.parseArgs();
    if ('list' in args) this.processList(args);
    else if ('status' in args) await this.processStatus(args);
    else if ('create' in args) await this.runDatabases('create', args);
    else if ('migrate' in args) await this.runDatabases('migrate', args);
    else if ('clear' in args) await this.runDatabases('clear', args);
    else if ('sql' in args) await this.processSql(args as { sql: string });
    else this.processHelp(args as { help: string });
  }

  getModuleNamesFromServer(): string[] {
    return this.getDbServiceRows().map((row) => row.moduleName);
  }

  getModuleNamesFromArg(args: Args): 'all' | string[] {
    if (!args.module) return [];
    const moduleNames = args.module;

    if (moduleNames === 'all') return 'all';
    return moduleNames ? moduleNames.split(' ') : [];
  }

  findDatabase(moduleName: string): Database | undefined {
    return this.getDbServiceRows().find((row) => row.moduleName === moduleName)?.db;
  }

  getDbServiceRows(moduleNames: string[] | 'all' = 'all'): DatabaseServiceRow[] {
    const runModules = moduleNames === 'all'
      ? this.modules
      : this.modules.filter((m) => moduleNames.includes(m.moduleName));
    return runModules.map((m) => ({
      moduleName: m.moduleName,
      db: m.getModuleResolver().getDatabase() as Database,
    }));
  }

  protected processHelp(args: { help: string }): void {
    const { help } = args;
    if (help === 'list') this.getListHelp();
    else if (help === 'status') this.helpStatus();
    else if (help === 'create') this.helpCreate();
    else if (help === 'migrate') this.helpMigrate();
    else if (help === 'clear') this.helpClear();
    else if (help === 'sql') this.helpSql();
    else if (help === 'module') this.output(this.getModuleHelp());
    else if (help === 'no-colored') this.output(this.getNoColoredHelp());
    else {
      const params = this.toGreen(`--help (${this.getHelpOptionList().join(' | ')})`);
      this.output(`\nЧтобы получить подсказку, запустите скрипт с параметром: ${params}`);
    }
  }

  protected processList(args: Args): void {
    const moduleNames = this.getModuleNamesFromArg(args);
    const dbRows = Array.isArray(moduleNames) && moduleNames.length > 0
      ? this.getDbServiceRows().filter((row) => moduleNames.includes(row.moduleName))
      : this.getDbServiceRows();
    let total = '';
    dbRows.forEach((row) => {
      total += `\nmoduleName: ${this.toGreen(row.moduleName)}\n`;
      total = row.db.getRepositories().reduce(
        (outStr, repo) => `${outStr}  repo: ${this.toGreen(repo.tableName)}\n`,
        total,
      );
    });
    this.output(total);
  }

  protected getListHelp(): void {
    this.output(`\n${this.toGreen('--ls')}: выводит список БД (имен модулей) и репозиториев.`);
  }

  protected async processStatus(args: Args): Promise<void> {
    const moduleNames = this.getModuleNamesFromArg(args);
    const dbRows = Array.isArray(moduleNames) && moduleNames.length > 0
      ? this.getDbServiceRows().filter((row) => moduleNames.includes(row.moduleName))
      : this.getDbServiceRows();
    const promises = Promise.all(
      dbRows.map((sRow) => this.getStatusAsString(sRow)),
    );
    this.output((await promises).join('\n'));
  }

  protected async getStatusAsString(serviceRow: DatabaseServiceRow): Promise<string> {
    const paintStatus = (s: string): string => (
      ['complete', 'notRequired', 'true'].includes(s)
        ? this.toGreen(s)
        : this.toRed(s)
    );

    const { db } = serviceRow;
    const dbName = this.toBright(`module name: ${(serviceRow.moduleName)}\n`);
    const dbCreateStatus = `db creation status = ${paintStatus(await db.creationStatus())}\n`;
    const dbMigrateStatus = `db migration status = ${paintStatus(await db.migrationStatus())}\n`;
    const repoStatuses = await Promise.all(db.getRepositories()
      .map(async (repo) => ({
        name: this.toBright(repo.tableName),
        isCreated: paintStatus(String(await repo.isCreated())),
        migrationStatus: paintStatus(await repo.getMigrateStatus()),
      })));
    const repoStatusesAsString = repoStatuses.map(
      (rec) => Object.entries(rec).reduce((total, [key, value]) => `${total}  ${key}: ${value}\n`, 'repository:\n'),
    ).join('');
    return `${dbName}${dbCreateStatus}${dbMigrateStatus}${repoStatusesAsString}`;
  }

  helpStatus(): void {
    const arg = this.toGreen('\n--status [--module <all | moduleNames>]:');
    const statusDesc = ' покажет для указанных модулей состояния создания и миграции БД и репозиториев.\n';
    const moduleDesc = ` ${this.toGreen('--module')}: укажите имена модулей статус которых вы хотите просмотреть. Пропуск или all выводит все модули.`;
    this.output(`${arg}${statusDesc}${moduleDesc}`);
  }

  protected helpCreate(): void {
    const options = this.toGreen('\n--create [--module <module-params>]:');
    const desc = ' выполнит создание и миграции БД и репозиториев.';
    const moduleDesc = ` ${this.toGreen('--module')}: укажите имена модулей через пробел, БД которых необходимо создать. Если хотите захватить все модули, укажите "all", пропуск опции также применяет команду ко всем БД (модулям.)`;
    this.output(`${options}${desc}${moduleDesc}`);
  }

  protected helpMigrate(): void {
    const options = this.toGreen('\n--migrate [--module <module-params>]:');
    const desc = ' выполнит миграции БД и репозиториев.';
    const moduleDesc = ` ${this.toGreen('--module')}: укажите имена модулей через пробел, БД которых необходимо мигрировать. Если хотите захватить все модули, укажите "all", пропуск опции также применяет команду ко всем БД (модулям.)`;
    this.output(`${options}${desc}${moduleDesc}`);
  }

  protected helpClear(): void {
    const options = this.toGreen('\n--clear [--module <module-params>]:');
    const desc = ' очистит (удали записи) с БД и репозиториев.';
    const moduleDesc = ` ${this.toGreen('--module')}: укажите имена модулей через пробел, БД которых необходимо очистить. Если хотите захватить все модули, укажите "all", пропуск опции также применяет команду ко всем БД (модулям.).`;
    this.output(`${options}${desc}${moduleDesc}`);
  }

  protected getModuleHelp(): string {
    const modulesArg = `${this.toGreen('--module (all | <module-names>)')}\n`;
    const allDesc = `  ${this.toGreen('all')}: выполнить команду для всех модулей сервера.\n`;
    const moduleNamesDesc = `  ${this.toGreen('<module-names>')}: укажите один или несколько имен модулей (через пробел).\n`;
    const allModuleNames = this.getModuleNamesFromServer().join(' ');
    const currServerModuleNames = `  ${this.toGreen('текущие имена')}: ${this.toBright(allModuleNames)}.`;
    return `${modulesArg}${allDesc}${moduleNamesDesc}${currServerModuleNames}`;
  }

  protected getNoColoredHelp(): string {
    const noColoredArg = `${this.toGreen('--no-colored')}\n`;
    const desc = `  ${this.toGreen('без опции')}: выключает цвета при выводе сообщений. Может быть полезно, если вы хотите выключить escape codes форматирования.\n`;
    const envDesc = `  ${this.toGreen('env')}: вы также можете управлять этим параметром через NO_COLORED переменную окружения.`;
    return `${noColoredArg}${desc}${envDesc}`;
  }

  protected async processSql(args: { sql: string }): Promise<void> {
    const moduleNames = this.getModuleNamesFromArg(args);
    const help = `Для получения справки наберите: ${this.toGreen('--help sql')}`;

    if (moduleNames.length === 0 || moduleNames === 'all') {
      this.output(`Для выполнения sql запросов необходимо явно указать имя модуля. ${help}`);
      return;
    }
    if (moduleNames.length > 1) {
      this.output(`Вы указали более одного модуля, sql запрос можно выполнять только для одной БД. ${help}`);
      return;
    }
    if (this.getModuleNamesFromServer().includes(moduleNames[0]) === false) {
      this.output(`Переданное имя модуля не валидно. ${help}`);
      return;
    }
    const method = this.getSqlMethod(args);
    if (!method) {
      this.output(`Неверное имя метода. ${help}`);
      return;
    }
    const result = await this.sql(moduleNames[0], args.sql, method);
    const json = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    this.output(`${consoleColor.blink('Результаты выполнения:')}\n${json}`);
  }

  protected helpSql(): void {
    const leadStr = `${this.toGreen('--sql "<valid sql string>" [--method <method>] --module "<module-params>"')}\n`;
    const sqlDesc = `  ${this.toGreen('sql')}: укажите валидный sql запрос\n`;
    const methodDesc = `  ${this.toGreen('--method')}: укажите тип запроса из следующих вариантов ${this.toGreen('all, get, run')}. Необязательно, по умолчанию ${this.toGreen('all')}\n`;
    const moduleDesc = `  ${this.toGreen('--module')}: укажите имя модуля, БД которого нужно выполнить запрос. Текущие модули ${this.getModuleNamesFromServer().join(' ')}\n`;
    const additionalDesc = `  ${this.toGreen('Дополнительно')}: спецсимволы необходимо экранировать, например: ${this.toGreen('bun service-db --sgl "SELECT \\* FROM users WHERE userId=\\\'0190de3e-1646-7c01-b0c2-2d1e39e4af73\\\'"')}`;

    this.output(`${leadStr}${sqlDesc}${methodDesc}${moduleDesc}${additionalDesc}`);
  }

  protected getHelpOptionList(): string[] {
    return ['list', 'status', 'create', 'migrate', 'clear', 'sql', 'module', 'no-colored'];
  }

  protected getSqlMethod(args: Args): SqlMethod | undefined {
    const { method } = args;
    if (method && (method === 'all' || method === 'get' || method === 'run')) {
      return method;
    }
    if (!method) {
      const defaultStr = `Будет использоваться метод по умолчанию: ${this.toGreen('all')}`;
      this.output(`Вы не указали sql method. ${defaultStr}`);
      return 'all';
    }
    return undefined;
  }

  protected async runDatabases(command: 'migrate' | 'create' | 'clear', args: Args): Promise<void> {
    const moduleNames = this.getModuleNamesFromArg(args);
    if (Array.isArray(moduleNames) && moduleNames.length === 0) {
      this.output(`Не указана опция --module. Для справки наберите: ${this.toGreen(`--help ${command}`)}`);
      return;
    }
    const moduleDbRows = this.getDbServiceRows(moduleNames);
    // eslint-disable-next-line no-restricted-syntax
    for (const row of moduleDbRows) {
      const [dbMethod, dbStatusMethod, eventStr] = command === 'migrate'
        ? [row.db.migrateDb.bind(row.db), row.db.migrationStatus.bind(row.db), 'migrated']
        : command === 'create'
          ? [row.db.createDb.bind(row.db), row.db.creationStatus.bind(row.db), 'created']
          : [row.db.clearDb.bind(row.db), (): 'none' => 'none', 'cleared'];

      const status = await dbStatusMethod();
      if (status !== 'complete') {
        await dbMethod();
        this.output(`${this.toGreen(`${row.moduleName} db ${eventStr}`)}. Previous status: ${this.toBright(status)}`);
      } else {
        this.output(`${row.moduleName} db not ${eventStr}, because status: ${this.toBright(status)}`);
      }
    }
  }

  protected toBright(str: string): string {
    return this.needColor() ? consoleColor.bright(str) : str;
  }

  protected toRed(str: string): string {
    return this.needColor() ? consoleColor.fgColor(str, 'Red') : str;
  }

  protected toGreen(str: string): string {
    return this.needColor() ? consoleColor.fgColor(str, 'Green') : str;
  }

  protected needColor(): boolean {
    return !process.env.NO_COLORED && !process.argv.includes('--no-colored') && true;
  }

  protected parseArgs(): Args {
    const { argv } = process;
    const args: Args = {};
    let currentKey: string | null = null;
    let currentValue: string[] = [];

    argv.slice(2).forEach((arg) => {
      if (arg.startsWith('--')) {
        if (currentKey) {
          args[currentKey] = currentValue.join(' ');
          currentValue = [];
        }
        currentKey = arg.slice(2);
      } else if (currentKey) {
        currentValue.push(arg);
      }
    });

    if (currentKey) {
      args[currentKey] = currentValue.join(' ');
    }

    return args;
  }

  protected output(outData: unknown): void {
    const out = typeof outData === 'string'
      ? outData
      : JSON.stringify(outData, null, 2);
    // eslint-disable-next-line no-console
    console.log(out);
  }
}
