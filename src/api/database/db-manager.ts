import { Module } from '#api/module/module.js';
import { ServerStarter } from '#api/server/server-starter.js';
import { RilataServer } from '#api/server/server.js';
import { Constructor } from '#core/types.js';
import { FullDatabase } from './full.database.ts';
import { ServiceDatabase } from './service.database.ts';
import { DatabaseServiceRow } from './types.ts';

/**
*   Выполнить обслуживание БД. Примеры использования:
    Создать файл обуслуживающий команду и передающий в конструктор server-starter;
*   `METHOD=status COLOR=1 bun ./service-db.ts` - распечатает имена доступных модулей.
      COLOR - добавляет цвета.
*   `METHOD=create MODULES=all bun ./service-db.ts` - создаст БД для всех модулей и сделает миграции
*   `METHOD=create MODULES=Module1,Module2 bun ./service-db.ts` - создаст БД
      для приведенных модулей и сделает миграции.
*   `METHOD=migrate MODULES=Module1,Module2 bun ./service-db.ts` - выполнит миграции БД
      для приведенных модулей
*/
export class DatabaseManager {
  private server: RilataServer;

  constructor(Starter: Constructor<ServerStarter<Module>>) {
    process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';
    process.env.LOG_MODE = 'off';
    const serverStarter = new Starter();
    this.server = serverStarter.start('all');
  }

  async run(): Promise<void> {
    const method = this.getMethod();
    if (method === 'status') {
      // eslint-disable-next-line no-console
      console.log(await this.getStatuses());
    } else {
      await this.runDatabases(method);
    }
    await Promise.resolve();
    this.server.stop();
  }

  protected async getStatuses(): Promise<string> {
    const color = Boolean(process.env.COLOR);
    const promises = Promise.all(
      this.getDbServiceRows().map((sRow) => sRow.db.getStatusAsString(color)),
    );
    const resolveds = await promises;
    return resolveds.join('\n\n');
  }

  protected getMethod(): 'migrate' | 'create' | 'status' {
    const envMethod = process.env.METHOD;
    if (envMethod && (envMethod === 'migrate' || envMethod === 'create' || envMethod === 'status')) {
      return envMethod;
    }
    throw Error('not finded or not valid method for work with databases');
  }

  protected async runDatabases(method: 'migrate' | 'create'): Promise<void> {
    const moduleNames = this.getEnvModuleNames();
    const databases = this.getDbServiceRows(moduleNames);
    databases.forEach(async (item) => {
      if (method === 'migrate') (item.db as ServiceDatabase).migrateDb();
      else if (method === 'create') (item.db as ServiceDatabase).createDb();
    });
    this.server.stop();
  }

  /** ищет в env.MODULES имена модулей, если не найдет, то возвращает 'all'.
      Если хотите передать несколько модулей, то перечисляйте через запятую.
  */
  protected getEnvModuleNames(): string[] | 'all' {
    const envModules = process.env.MODULES;
    return envModules
      ? envModules.split(',').map((m) => m.trim())
      : 'all';
  }

  protected getDbServiceRows(moduleNames: string[] | 'all' = 'all'): DatabaseServiceRow {
    const modules = this.server.getModules();
    const runModules = moduleNames === 'all'
      ? modules
      : modules.filter((m) => moduleNames.includes(m.moduleName));
    return runModules.map((m) => ({
      moduleName: m.moduleName,
      db: m.getModuleResolver().getDatabase() as FullDatabase<false>,
    }));
  }
}
