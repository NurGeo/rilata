/* eslint-disable no-await-in-loop */
import { Module } from '#api/module/module.js';
import { ServerStarter } from '#api/server/server-starter.js';
import { RilataServer } from '#api/server/server.js';
import { Constructor, MaybePromise } from '#core/types.js';
import { consoleColor } from '#core/utils/string/console-color.js';
import { FullDatabase } from './full.database.ts';
import { ServiceDatabase } from './service.database.ts';
import { Args, DatabaseServiceRow, ServiceCommands, SqlMethod } from './types.ts';

export const suppliesCommands = ['status', 'migrate', 'create', 'clear'] as const;

export abstract class DatabaseManager {
  private server: RilataServer;

  constructor(Starter: Constructor<ServerStarter<Module>>) {
    process.env.LOG_MODE = 'off';
    const serverStarter = new Starter();
    this.server = serverStarter.start('all');
  }

  abstract sql<R>(moduleName: string, sql: string, method: SqlMethod): MaybePromise<R | undefined>

  async run(): Promise<void> {
    const args = this.parseArgs();
    if ('command' in args) await this.processCommand(args as { command: string });
    else if ('sql' in args) await this.processSql(args as { sql: string });
    else if ('help' in args) this.processHelp(args as { help: string });
    else this.output(this.getHelp());
    return this.stop();
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

  findDatabase(moduleName: string): ServiceDatabase | undefined {
    return this.getDbServiceRows().find((row) => row.moduleName === moduleName)?.db;
  }

  getDbServiceRows(moduleNames: string[] | 'all' = 'all'): DatabaseServiceRow {
    const modules = this.server.getModules();
    const runModules = moduleNames === 'all'
      ? modules
      : modules.filter((m) => moduleNames.includes(m.moduleName));
    return runModules.map((m) => ({
      moduleName: m.moduleName,
      db: m.getModuleResolver().getDatabase() as FullDatabase,
    }));
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

  protected getSqlHelp(): string {
    const leadStr = `${this.toGreen('--sql "<valid sql string>" [--method <method>] --module "<module-params>"')}\n`;
    const sqlDesc = `  ${this.toGreen('sql')}: укажите валидный sql запрос\n`;
    const methodDesc = `  ${this.toGreen('--method')}: укажите тип запроса из следующих вариантов ${this.toGreen('all, get, run')}. Необязательно, по умолчанию ${this.toGreen('all')}\n`;
    const moduleDesc = `  ${this.toGreen('--module')}: укажите имя модуля, БД которого нужно выполнить запрос. Текущие модули ${this.getModuleNamesFromServer().join(' ')}\n`;
    const additionalDesc = `  ${this.toGreen('Дополнительно')}: спецсимволы необходимо экранировать, например: ${this.toGreen('bun query-db -sql "SELECT \\* FROM users" --module UserModule')}`;

    return `${leadStr}${sqlDesc}${methodDesc}${moduleDesc}${additionalDesc}`;
  }

  protected processHelp(args: { help: string }): void {
    const { help } = args;
    if (help === 'command') this.output(this.getCommandHelp());
    else if (help === 'sql') this.output(this.getSqlHelp());
    else if (help === 'module') this.output(this.getModuleHelp());
    else if (help === 'no-colored') this.output(this.getNoColoredHelp());
    else this.output(this.getHelp());
  }

  protected getHelp(): string {
    const params = this.toGreen(`--help (${this.getHelpCommands().join(' | ')})`);
    return `Чтобы получить подсказку, запустите скрипт с параметром: ${params}`;
  }

  protected getHelpCommands(): string[] {
    return ['command', 'sql', 'module', 'no-colored'];
  }

  protected async processCommand(args: { 'command': string }): Promise<void> {
    const command = this.checkCommand(args) as ServiceCommands;
    if (!command) return;
    if (command === 'status') {
      this.output(await this.getStatuses(args));
    } else {
      const moduleNames = this.getModuleNamesFromArg(args);
      await this.runDatabases(command, moduleNames);
    }
    this.server.stop();
  }

  protected getCommandHelp(): string {
    const options = this.toGreen(`--command (${suppliesCommands.join(' | ')}) --module <module-params>\n`);
    const statusDesc = `  ${this.toGreen('status')}: покажет для указанных модулей состояния создания и миграции БД и репозиториев.\n`;
    const createDesc = `  ${this.toGreen('create')}: выполнит для указанных модулей создание и миргации БД и репозиториев.\n`;
    const migrateDesc = `  ${this.toGreen('migrate')}: выполнит для указанных модулей миргации БД и репозиториев.\n`;
    const clearDesc = `  ${this.toGreen('clear')}: очистит все записи в БД указанных модулей.\n`;
    const moduleDesc = `  ${this.toGreen('--module')}: укажите имя модуля, БД которого нужно выполнить запрос.\n    - если хотите захватить все модули, укажите "all".\n    - если хотите указать несколько модулей, перечислите имена через пробел.`;
    return `${options}${statusDesc}${createDesc}${migrateDesc}${clearDesc}${moduleDesc}`;
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

  protected getSqlMethod(args: Args): SqlMethod | undefined {
    const { method } = args;
    if (method && (method === 'all' || method === 'get' || method === 'run')) {
      return method;
    }
    if (!method) {
      const defaultStr = `Будет использоваться метод по умолчанию: ${this.toRed('all')}`;
      this.output(`Вы не указали sql method. ${defaultStr}`);
      return 'all';
    }
    return undefined;
  }

  protected async runDatabases(
    command: 'migrate' | 'create' | 'clear',
    moduleNames: 'all' | string[],
  ): Promise<void> {
    const moduleDbRows = this.getDbServiceRows(moduleNames);
    // eslint-disable-next-line no-restricted-syntax
    for (const row of moduleDbRows) {
      const [dbMethod, dbStatusMethod, eventStr] = command === 'migrate'
        ? [row.db.migrateDb, row.db.migrationStatus, 'migrated']
        : command === 'create'
          ? [row.db.createDb, row.db.creationStatus, 'created']
          : [row.db.clearDb, (): 'none' => 'none', 'cleared'];

      const status = await dbStatusMethod();
      if (status !== 'complete') {
        await dbMethod();
        this.output(`${this.toGreen(`${row.moduleName} db ${eventStr}`)}. Previous status: ${this.toBright(status)}`);
      } else {
        this.output(`${row.moduleName} db not ${eventStr}, because status: ${this.toBright(status)}`);
      }
    }
    this.stop();
  }

  protected stop(): void {
    this.server.stop();
  }

  protected async getStatuses(args: Args): Promise<string> {
    const moduleNames = this.getModuleNamesFromArg(args);
    const dbRows = Array.isArray(moduleNames) && moduleNames.length > 0
      ? this.getDbServiceRows().filter((row) => moduleNames.includes(row.moduleName))
      : this.getDbServiceRows();
    const promises = Promise.all(
      dbRows.map((sRow) => sRow.db.getStatusAsString(this.needColor())),
    );
    const resolveds = await promises;
    return resolveds.join('\n\n');
  }

  protected checkCommand(args: { command: string }): ServiceCommands | undefined {
    if (suppliesCommands.includes(args.command as ServiceCommands)) {
      return args.command as ServiceCommands;
    }

    const helpStr = ` Для получения справки наберите: ${this.toGreen('--help command')}.`;
    if (args.command === '') {
      this.output(`Неверное использование опции command, не указано значение имя комманды.${helpStr}`);
    } else if (args.command.split(' ').length > 1) {
      this.output(`Неверное использование опции command, получено более одного значения команды.${helpStr}`);
    } else {
      this.output(`Неверное использование опции command, переданное значение не является командой.${helpStr}`);
    }
    return undefined;
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
