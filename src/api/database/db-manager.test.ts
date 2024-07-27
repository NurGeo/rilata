/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, test, expect, spyOn, beforeEach, Mock } from 'bun:test';
import { DatabaseManager } from './db-manager.ts';
import { Constructor, MaybePromise } from '#core/types.js';
import { DatabaseServiceStatus, SqlMethod } from './types.ts';
import { GeneralModuleResolver, Module, RilataServer, ServerStarter } from '#api/base.index.js';
import { FullDatabase } from './full.database.ts';

const userResolve = {
  userDb: {
    getStatusAsString(): string {
      return 'Module: UserModule\n  Repo: users\n    created: true\n    migreated: true';
    },

    createDb(): void { throw Error('not implemented'); },

    creationStatus(): MaybePromise<DatabaseServiceStatus> { throw Error('not implemented'); },

    migrateDb(): void { throw Error('not implemented'); },

    migrationStatus(): MaybePromise<DatabaseServiceStatus> { throw Error('not implemented'); },

    clearDb(): void { throw Error('not implemented'); },
  } as unknown as FullDatabase,

  userResolver: {
    getDatabase(): FullDatabase {
      return userResolve.userDb;
    },
  } as unknown as GeneralModuleResolver,
};

const userModule = {
  moduleName: 'UserModule',
  getModuleResolver(): GeneralModuleResolver {
    return userResolve.userResolver;
  },
} as unknown as Module;

const postResolve = {
  postDb: {
    getStatusAsString(): string {
      return 'Module: PostModule\n  Repo: posts\n    created: true\n    migreated: true\n  Repo: authors\n    created: true\n    migreated: true';
    },

    createDb(): void { throw Error('not implemented'); },

    creationStatus(): MaybePromise<DatabaseServiceStatus> { throw Error('not implemented'); },

    migrateDb(): void { throw Error('not implemented'); },

    migrationStatus(): MaybePromise<DatabaseServiceStatus> { throw Error('not implemented'); },

    clearDb(): void { throw Error('not implemented'); },
  } as unknown as FullDatabase,

  postResolver: {
    getDatabase(): FullDatabase {
      return postResolve.postDb;
    },
  } as unknown as GeneralModuleResolver,
};

const postModule = {
  moduleName: 'PostModule',

  getModuleResolver(): GeneralModuleResolver {
    return postResolve.postResolver;
  },
} as unknown as Module;

const server = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stop(): void {},

  getModules(): Module[] {
    return [userModule, postModule];
  },
} as unknown as RilataServer;

class TestServerStarter {
  start(): RilataServer {
    return server;
  }
}

class TestDatabaseManager extends DatabaseManager {
  sql<R>(moduleName: string, sql: string, method: SqlMethod): MaybePromise<R | undefined> {
    throw new Error('Method not implemented.');
  }
}

const argv = [...process.argv];

describe('DatabaseManager tests', () => {
  const sut = new TestDatabaseManager(
    TestServerStarter as unknown as Constructor<ServerStarter<Module>>,
  );
  const usersDb = userResolve.userDb;
  const postsDb = postResolve.postDb;

  // @ts-expect-error
  const outputSpy = spyOn(sut, 'output').mockImplementation();

  beforeEach(() => {
    outputSpy.mockClear();
    process.argv = [...argv];
  });

  describe('help option tests', () => {
    test('help for not parsed option case', async () => {
      process.argv.push('--not-valid-option', 'some option value');
      await sut.run();

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('Чтобы получить подсказку, запустите скрипт с параметром: \u001b[32m--help (command | sql | module | no-colored)\u001b[0m');
    });

    test('help for command option ', async () => {
      process.argv.push('--help', 'command');
      await sut.run();

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('\u001b[32m--command (status | migrate | create | clear) --module <module-params>\n\u001b[0m  \u001b[32mstatus\u001b[0m: покажет для указанных модулей состояния создания и миграции БД и репозиториев.\n  \u001b[32mcreate\u001b[0m: выполнит для указанных модулей создание и миргации БД и репозиториев.\n  \u001b[32mmigrate\u001b[0m: выполнит для указанных модулей миргации БД и репозиториев.\n  \u001b[32mclear\u001b[0m: очистит все записи в БД указанных модулей.\n  \u001b[32m--module\u001b[0m: укажите имя модуля, БД которого нужно выполнить запрос.\n    - если хотите захватить все модули, укажите "all".\n    - если хотите указать несколько модулей, перечислите имена через пробел.');
    });

    test('help for sql option ', async () => {
      process.argv.push('--help', 'sql');
      await sut.run();

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('\u001b[32m--sql "<valid sql string>" [--method <method>] --module "<module-params>"\u001b[0m\n  \u001b[32msql\u001b[0m: укажите валидный sql запрос\n  \u001b[32m--method\u001b[0m: укажите тип запроса из следующих вариантов \u001b[32mall, get, run\u001b[0m. Необязательно, по умолчанию \u001b[32mall\u001b[0m\n  \u001b[32m--module\u001b[0m: укажите имя модуля, БД которого нужно выполнить запрос. Текущие модули UserModule PostModule\n  \u001b[32mДополнительно\u001b[0m: спецсимволы необходимо экранировать, например: \u001b[32mbun query-db -sql "SELECT \\* FROM users" --module UserModule\u001b[0m');
    });

    test('help for module', async () => {
      process.argv.push('--help', 'module');
      await sut.run();

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('\u001b[32m--module (all | <module-names>)\u001b[0m\n  \u001b[32mall\u001b[0m: выполнить команду для всех модулей сервера.\n  \u001b[32m<module-names>\u001b[0m: укажите один или несколько имен модулей (через пробел).\n  \u001b[32mтекущие имена\u001b[0m: \u001b[1mUserModule PostModule\u001b[0m.');
    });

    test('help for no colored', async () => {
      process.argv.push('--help', 'no-colored');
      await sut.run();

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('\u001b[32m--no-colored\u001b[0m\n  \u001b[32mбез опции\u001b[0m: выключает цвета при выводе сообщений. Может быть полезно, если вы хотите выключить escape codes форматирования.\n  \u001b[32menv\u001b[0m: вы также можете управлять этим параметром через NO_COLORED переменную окружения.');
    });
  });

  describe('no color option tests', () => {
    test('no colored by argv option', async () => {
      process.argv.push('--no-colored', '--help', 'module');
      await sut.run();

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('--module (all | <module-names>)\n  all: выполнить команду для всех модулей сервера.\n  <module-names>: укажите один или несколько имен модулей (через пробел).\n  текущие имена: UserModule PostModule.');
    });

    test('no colored by env option', async () => {
      process.env.NO_COLORED = '1'; // any true value
      process.argv.push('--help', 'module');
      await sut.run();
      process.env.NO_COLORED = undefined;

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('--module (all | <module-names>)\n  all: выполнить команду для всех модулей сервера.\n  <module-names>: укажите один или несколько имен модулей (через пробел).\n  текущие имена: UserModule PostModule.');
    });
  });

  describe('status command tests', () => {
    test('get all db statuses', async () => {
      process.argv.push('--command', 'status');
      await sut.run();
      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('Module: UserModule\n  Repo: users\n    created: true\n    migreated: true\n\nModule: PostModule\n  Repo: posts\n    created: true\n    migreated: true\n  Repo: authors\n    created: true\n    migreated: true');
    });

    test('get user and post db statuses', async () => {
      process.argv.push('--command', 'status', '--module', 'UserModule PostModule');
      await sut.run();
      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('Module: UserModule\n  Repo: users\n    created: true\n    migreated: true\n\nModule: PostModule\n  Repo: posts\n    created: true\n    migreated: true\n  Repo: authors\n    created: true\n    migreated: true');
    });

    test('get post and user db statuses <replaced and space case>', async () => {
      process.argv.push('--command', 'status', '--module', 'PostModule  UserModule');
      await sut.run();
      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('Module: UserModule\n  Repo: users\n    created: true\n    migreated: true\n\nModule: PostModule\n  Repo: posts\n    created: true\n    migreated: true\n  Repo: authors\n    created: true\n    migreated: true');
    });

    test('get user db statuses <one db case>', async () => {
      process.argv.push('--command', 'status', '--module', 'UserModule');
      await sut.run();
      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('Module: UserModule\n  Repo: users\n    created: true\n    migreated: true');
    });
  });

  describe('migrate command tests', () => {
    const userCreateDbSpy = spyOn(usersDb, 'createDb');
    const userCreationStatusSpy = spyOn(usersDb, 'creationStatus');
    const userMigrateDbSpy = spyOn(usersDb, 'migrateDb');
    const userMigrationStatusSpy = spyOn(usersDb, 'migrationStatus');
    const userClearDbSpy = spyOn(usersDb, 'clearDb');

    const postCreateDbSpy = spyOn(postsDb, 'createDb');
    const postCreationStatusSpy = spyOn(postsDb, 'creationStatus');
    const postMigrateDbSpy = spyOn(postsDb, 'migrateDb');
    const postMigrationStatusSpy = spyOn(postsDb, 'migrationStatus');
    const postClearDbSpy = spyOn(postsDb, 'clearDb');

    const fakeMethodForClearStatus = {
      notBeCalled(): MaybePromise<DatabaseServiceStatus> { throw Error('not implemented'); },
    };
    const fakeClearStatusSpy = spyOn(fakeMethodForClearStatus, 'notBeCalled');

    type TestSpyTuple = [
      string,
      string,
      Mock<() => void>,
      Mock<() => MaybePromise<DatabaseServiceStatus>>,
    ]

    const userMethodsTestTuples: TestSpyTuple[] = [
      ['create', 'created', userCreateDbSpy, userCreationStatusSpy],
      ['migrate', 'migrated', userMigrateDbSpy, userMigrationStatusSpy],
      ['clear', 'cleared', userClearDbSpy, fakeClearStatusSpy],
    ];

    const postMethodsTestTuples: TestSpyTuple[] = [
      ['create', 'created', postCreateDbSpy, postCreationStatusSpy],
      ['migrate', 'migrated', postMigrateDbSpy, postMigrationStatusSpy],
      ['clear', 'cleared', postClearDbSpy, fakeClearStatusSpy],
    ];

    test('migrate user and post module, but user db skiped and post db need partially migrate', async () => {
      process.argv.push('--command', 'migrate', '--module', 'PostModule UserModule');

      userMigrateDbSpy.mockReset();
      userMigrateDbSpy.mockImplementationOnce(() => {});
      userMigrationStatusSpy.mockReset();
      userMigrationStatusSpy.mockImplementationOnce(() => 'complete'); // not neet migrate

      postMigrateDbSpy.mockReset();
      postMigrateDbSpy.mockImplementationOnce(() => {});
      postMigrationStatusSpy.mockReset();
      postMigrationStatusSpy.mockImplementationOnce(() => 'partial'); // need partially migrate

      outputSpy.mockClear();

      await sut.run();

      expect(userMigrateDbSpy).toBeCalledTimes(0);
      expect(userMigrationStatusSpy).toBeCalledTimes(1);

      expect(postMigrateDbSpy).toBeCalledTimes(1);
      expect(postMigrationStatusSpy).toBeCalledTimes(1);

      expect(outputSpy).toBeCalledTimes(2);
      expect(outputSpy.mock.calls[0][0]).toContain('UserModule db not migrated');
      expect(outputSpy.mock.calls[1][0]).toContain('PostModule db migrated');
    });

    test('only user module all commands <create, migrate, clear> successfully called', async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const [command, eventStr, dbMethod, dbStatusMethod] of userMethodsTestTuples) {
        process.argv = [...argv];
        process.argv.push('--command', command, '--module', 'UserModule');
        dbMethod.mockReset();
        dbMethod.mockImplementationOnce(() => {});
        dbStatusMethod.mockReset();
        dbStatusMethod.mockImplementationOnce(() => 'none');
        outputSpy.mockClear();

        await sut.run();
        expect(dbMethod).toBeCalledTimes(1);
        const dbStatusMethosTimesCount = command === 'clear' ? 0 : 1;
        expect(dbStatusMethod).toBeCalledTimes(dbStatusMethosTimesCount);

        expect(outputSpy).toBeCalledTimes(1);
        expect(outputSpy.mock.calls[0][0]).toContain(`UserModule db ${eventStr}`);
      }
    });

    test('only user and post module all commands <create, migrate, clear> successfully called', async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const i of [0, 1, 2]) {
        const [command, eventStr, userDbMethod, userDbStatusMethod] = [...userMethodsTestTuples[i]];
        const [_, __, postDbMethod, postDbStatusMethod] = [...postMethodsTestTuples[i]];
        process.argv = [...argv];
        process.argv.push('--command', command, '--module', 'UserModule  PostModule');

        userDbMethod.mockReset();
        userDbMethod.mockImplementationOnce(() => {});
        userDbStatusMethod.mockReset();
        userDbStatusMethod.mockImplementationOnce(() => 'none');

        postDbMethod.mockReset();
        postDbMethod.mockImplementationOnce(() => {});
        postDbStatusMethod.mockReset();
        postDbStatusMethod.mockImplementationOnce(() => 'none');

        outputSpy.mockClear();

        await sut.run();

        const dbStatusMethosTimesCount = command === 'clear' ? 0 : 1;
        expect(userDbMethod).toBeCalledTimes(1);
        expect(userDbStatusMethod).toBeCalledTimes(dbStatusMethosTimesCount);

        expect(postDbMethod).toBeCalledTimes(1);
        expect(postDbStatusMethod).toBeCalledTimes(dbStatusMethosTimesCount);

        expect(outputSpy).toBeCalledTimes(2);
        expect(outputSpy.mock.calls[0][0]).toContain(`UserModule db ${eventStr}`);
        expect(outputSpy.mock.calls[1][0]).toContain(`PostModule db ${eventStr}`);
      }
    });
  });

  describe('sql command tests <abstract sql method called>', () => {
    const sqlSpy = spyOn(sut, 'sql');

    test('user db sql runned with default method <run>', async () => {
      process.argv.push('--sql', 'some sql for user db', '--module', 'UserModule');
      sqlSpy.mockReturnValue({ result: 'success' });
      sqlSpy.mockClear();

      await sut.run();

      expect(sqlSpy).toBeCalledTimes(1);
      expect(sqlSpy.mock.calls[0][0]).toBe('UserModule');
      expect(sqlSpy.mock.calls[0][1]).toBe('some sql for user db');
      expect(sqlSpy.mock.calls[0][2]).toBe('all');

      expect(outputSpy).toBeCalledTimes(2);
      expect(outputSpy.mock.calls[0][0]).toBe('Вы не указали sql method. Будет использоваться метод по умолчанию: \u001b[31mall\u001b[0m');
      expect(outputSpy.mock.calls[1][0]).toBe('\u001b[5mРезультаты выполнения:\u001b[0m\n{\n  "result": "success"\n}');
    });

    test('sql method not runned, because recieved two module name', async () => {
      process.argv.push('--sql', 'some sql for post db', '--module', 'PostModule UserModule');
      sqlSpy.mockImplementationOnce(() => { throw Error('not be called'); });
      sqlSpy.mockClear();

      await sut.run();

      expect(sqlSpy).toBeCalledTimes(0);

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('Вы указали более одного модуля, sql запрос можно выполнять только для одной БД. Для получения справки наберите: \u001b[32m--help sql\u001b[0m');
    });

    test('sql method not runned, because not found module name', async () => {
      process.argv.push('--sql', 'some sql for post db');
      sqlSpy.mockImplementationOnce(() => { throw Error('not be called'); });
      sqlSpy.mockClear();

      await sut.run();

      expect(sqlSpy).toBeCalledTimes(0);

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toStartWith('Для выполнения sql запросов необходимо явно указать имя модуля. Для получения справки наберите: \u001b[32m--help sql\u001b[0m');
    });

    test('post db sql runned with method other methods', async () => {
      sqlSpy.mockReset();
      sqlSpy.mockReturnValue({ result: 'success' });
      const methods = ['all', 'get', 'run'] as const;
      // eslint-disable-next-line no-restricted-syntax
      for (const method of methods) {
        process.argv = [...argv];
        process.argv.push('--sql', 'some sql for post db', '--module', 'PostModule', '--method', method);
        sqlSpy.mockClear();
        outputSpy.mockClear();

        await sut.run();

        expect(sqlSpy).toBeCalledTimes(1);
        expect(sqlSpy.mock.calls[0][0]).toBe('PostModule');
        expect(sqlSpy.mock.calls[0][1]).toBe('some sql for post db');
        expect(sqlSpy.mock.calls[0][2]).toBe(method);

        expect(outputSpy).toBeCalledTimes(1);
        expect(outputSpy.mock.calls[0][0]).toBe('\u001b[5mРезультаты выполнения:\u001b[0m\n{\n  "result": "success"\n}');
      }
    });
  });
});
