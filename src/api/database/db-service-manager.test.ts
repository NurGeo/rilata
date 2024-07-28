/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, test, expect, spyOn, beforeEach, Mock } from 'bun:test';
import { MaybePromise } from '#core/types.js';
import { DatabaseServiceStatus, SqlMethod } from './types.ts';
import { GeneralModuleResolver, Module } from '#api/base.index.js';
import { Database } from './database.ts';
import { DatabaseServiceManager } from './db-service-manager.ts';
import { Repository } from './repository.ts';
import { DTO } from '#domain/dto.js';

const repo = {
  tableName: 'users',

  isCreated(): MaybePromise<boolean> {
    return true;
  },

  getMigrateStatus(): MaybePromise<DatabaseServiceStatus> {
    return 'complete';
  },
} as unknown as Repository<string, DTO>;

const userResolve = {

  usersRepo: { ...repo },

  userDb: {
    createDb(): void { throw Error('not implemented'); },

    creationStatus(): MaybePromise<DatabaseServiceStatus> { throw Error('not implemented'); },

    migrateDb(): void { throw Error('not implemented'); },

    migrationStatus(): MaybePromise<DatabaseServiceStatus> { throw Error('not implemented'); },

    clearDb(): void { throw Error('not implemented'); },

    getRepositories(): Repository<string, DTO>[] {
      return [userResolve.usersRepo];
    },
  } as unknown as Database,

  userResolver: {
    getDatabase(): Database {
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
  postsRepo: { ...repo, tableName: 'posts' },

  authorsRepo: { ...repo, tableName: 'authors' },

  postDb: {
    createDb(): void { throw Error('not implemented'); },

    creationStatus(): MaybePromise<DatabaseServiceStatus> { throw Error('not implemented'); },

    migrateDb(): void { throw Error('not implemented'); },

    migrationStatus(): MaybePromise<DatabaseServiceStatus> { throw Error('not implemented'); },

    clearDb(): void { throw Error('not implemented'); },

    getRepositories(): Repository<string, DTO>[] {
      return [postResolve.postsRepo, postResolve.authorsRepo];
    },
  } as unknown as Database,

  postResolver: {
    getDatabase(): Database {
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

class TestDatabaseManager extends DatabaseServiceManager {
  sql<R>(_moduleName: string, _sql: string, _method: SqlMethod): MaybePromise<R | undefined> {
    throw new Error('Method not implemented.');
  }
}

const argv = [...process.argv];

describe('DatabaseManager tests', () => {
  const sut = new TestDatabaseManager([userModule, postModule]);

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
      expect(outputSpy.mock.calls[0][0]).toBe('\nЧтобы получить подсказку, запустите скрипт с параметром: \u001b[32m--help (list | status | create | migrate | clear | sql | module | no-colored)\u001b[0m');
    });

    test('help for without option ', async () => {
      process.argv.push('--help');
      await sut.run();

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('\nЧтобы получить подсказку, запустите скрипт с параметром: \u001b[32m--help (list | status | create | migrate | clear | sql | module | no-colored)\u001b[0m');
    });

    test('help for sql option ', async () => {
      process.argv.push('--help', 'sql');
      await sut.run();

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('\u001b[32m--sql "<valid sql string>" [--method <method>] --module "<module-params>"\u001b[0m\n  \u001b[32msql\u001b[0m: укажите валидный sql запрос\n  \u001b[32m--method\u001b[0m: укажите тип запроса из следующих вариантов \u001b[32mall, get, run\u001b[0m. Необязательно, по умолчанию \u001b[32mall\u001b[0m\n  \u001b[32m--module\u001b[0m: укажите имя модуля, БД которого нужно выполнить запрос. Текущие модули UserModule PostModule\n  \u001b[32mДополнительно\u001b[0m: спецсимволы необходимо экранировать, например: \u001b[32mbun service-db --sgl "SELECT \\* FROM users WHERE userId=\\\'0190de3e-1646-7c01-b0c2-2d1e39e4af73\\\'"\u001b[0m');
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

  describe('list option tests', () => {
    test('runned and returned list of modules <databaseses> and repositories', async () => {
      process.argv.push('--list');
      await sut.run();

      expect(outputSpy).toBeCalledTimes(1);
      expect(outputSpy.mock.calls[0][0]).toBe('\nmoduleName: \u001B[32mUserModule\u001B[0m\n  repo: \u001B[32musers\u001B[0m\n\nmoduleName: \u001B[32mPostModule\u001B[0m\n  repo: \u001B[32mposts\u001B[0m\n  repo: \u001B[32mauthors\u001B[0m\n');
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

  describe('ls and status tests', () => {
    const userCreateDbSpy = spyOn(userResolve.userDb, 'createDb');
    const userCreationStatusSpy = spyOn(userResolve.userDb, 'creationStatus');
    const userMigrateDbSpy = spyOn(userResolve.userDb, 'migrateDb');
    const userMigrationStatusSpy = spyOn(userResolve.userDb, 'migrationStatus');
    const userClearDbSpy = spyOn(userResolve.userDb, 'clearDb');

    const postCreateDbSpy = spyOn(postResolve.postDb, 'createDb');
    const postCreationStatusSpy = spyOn(postResolve.postDb, 'creationStatus');
    const postMigrateDbSpy = spyOn(postResolve.postDb, 'migrateDb');
    const postMigrationStatusSpy = spyOn(postResolve.postDb, 'migrationStatus');
    const postClearDbSpy = spyOn(postResolve.postDb, 'clearDb');

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

    describe('status command tests', () => {
      test('get all db statuses', async () => {
        userCreationStatusSpy.mockReset();
        userCreationStatusSpy.mockReturnValueOnce('complete');
        userMigrationStatusSpy.mockReset();
        userMigrationStatusSpy.mockReturnValueOnce('complete');

        postCreationStatusSpy.mockReset();
        postCreationStatusSpy.mockReturnValueOnce('complete');
        postMigrationStatusSpy.mockReset();
        postMigrationStatusSpy.mockImplementationOnce(() => 'complete');

        process.argv.push('--status');
        await sut.run();
        expect(outputSpy).toBeCalledTimes(1);
        expect(outputSpy.mock.calls[0][0]).toBe('\u001B[1mmodule name: UserModule\n\u001B[0mdb creation status = \u001B[32mcomplete\u001B[0m\ndb migration status = \u001B[32mcomplete\u001B[0m\nrepository:\n  name: \u001B[1musers\u001B[0m\n  isCreated: \u001B[32mtrue\u001B[0m\n  migrationStatus: \u001B[32mcomplete\u001B[0m\n\n\u001B[1mmodule name: PostModule\n\u001B[0mdb creation status = \u001B[32mcomplete\u001B[0m\ndb migration status = \u001B[32mcomplete\u001B[0m\nrepository:\n  name: \u001B[1mposts\u001B[0m\n  isCreated: \u001B[32mtrue\u001B[0m\n  migrationStatus: \u001B[32mcomplete\u001B[0m\nrepository:\n  name: \u001B[1mauthors\u001B[0m\n  isCreated: \u001B[32mtrue\u001B[0m\n  migrationStatus: \u001B[32mcomplete\u001B[0m\n');
      });

      test('get user and post db statuses', async () => {
        process.argv.push('--status', '--module', 'UserModule PostModule');

        userCreationStatusSpy.mockReset();
        userCreationStatusSpy.mockReturnValueOnce('complete');
        userMigrationStatusSpy.mockReset();
        userMigrationStatusSpy.mockImplementationOnce(() => 'complete'); // not need migrate

        postCreationStatusSpy.mockReset();
        postCreationStatusSpy.mockReturnValueOnce('complete');
        postMigrationStatusSpy.mockReset();
        postMigrationStatusSpy.mockImplementationOnce(() => 'partial'); // need partially migrate

        spyOn(postResolve.authorsRepo, 'getMigrateStatus').mockReturnValueOnce('partial');

        await sut.run();
        expect(outputSpy).toBeCalledTimes(1);
        expect(outputSpy.mock.calls[0][0]).toBe('\u001B[1mmodule name: UserModule\n\u001B[0mdb creation status = \u001B[32mcomplete\u001B[0m\ndb migration status = \u001B[32mcomplete\u001B[0m\nrepository:\n  name: \u001B[1musers\u001B[0m\n  isCreated: \u001B[32mtrue\u001B[0m\n  migrationStatus: \u001B[32mcomplete\u001B[0m\n\n\u001B[1mmodule name: PostModule\n\u001B[0mdb creation status = \u001B[32mcomplete\u001B[0m\ndb migration status = \u001B[31mpartial\u001B[0m\nrepository:\n  name: \u001B[1mposts\u001B[0m\n  isCreated: \u001B[32mtrue\u001B[0m\n  migrationStatus: \u001B[32mcomplete\u001B[0m\nrepository:\n  name: \u001B[1mauthors\u001B[0m\n  isCreated: \u001B[32mtrue\u001B[0m\n  migrationStatus: \u001B[31mpartial\u001B[0m\n');
      });

      test('get post and user db statuses <replaced and space case>', async () => {
        process.argv.push('--status', '--module', 'PostModule  UserModule');

        userCreationStatusSpy.mockReset();
        userCreationStatusSpy.mockReturnValueOnce('complete');
        userMigrationStatusSpy.mockReset();
        userMigrationStatusSpy.mockImplementationOnce(() => 'complete');

        postCreationStatusSpy.mockReset();
        postCreationStatusSpy.mockReturnValueOnce('complete');
        postMigrationStatusSpy.mockReset();
        postMigrationStatusSpy.mockReturnValueOnce('complete');

        await sut.run();
        expect(outputSpy).toBeCalledTimes(1);
        expect(outputSpy.mock.calls[0][0]).toBe('\u001B[1mmodule name: UserModule\n\u001B[0mdb creation status = \u001B[32mcomplete\u001B[0m\ndb migration status = \u001B[32mcomplete\u001B[0m\nrepository:\n  name: \u001B[1musers\u001B[0m\n  isCreated: \u001B[32mtrue\u001B[0m\n  migrationStatus: \u001B[32mcomplete\u001B[0m\n\n\u001B[1mmodule name: PostModule\n\u001B[0mdb creation status = \u001B[32mcomplete\u001B[0m\ndb migration status = \u001B[32mcomplete\u001B[0m\nrepository:\n  name: \u001B[1mposts\u001B[0m\n  isCreated: \u001B[32mtrue\u001B[0m\n  migrationStatus: \u001B[32mcomplete\u001B[0m\nrepository:\n  name: \u001B[1mauthors\u001B[0m\n  isCreated: \u001B[32mtrue\u001B[0m\n  migrationStatus: \u001B[32mcomplete\u001B[0m\n');
      });

      test('get user db statuses <one db case>', async () => {
        process.argv.push('--status', '--module', 'UserModule');

        userCreationStatusSpy.mockReset();
        userCreationStatusSpy.mockReturnValueOnce('complete');
        userMigrationStatusSpy.mockReset();
        userMigrationStatusSpy.mockImplementationOnce(() => 'complete');

        await sut.run();
        expect(outputSpy).toBeCalledTimes(1);
        expect(outputSpy.mock.calls[0][0]).toBe('\u001B[1mmodule name: UserModule\n\u001B[0mdb creation status = \u001B[32mcomplete\u001B[0m\ndb migration status = \u001B[32mcomplete\u001B[0m\nrepository:\n  name: \u001B[1musers\u001B[0m\n  isCreated: \u001B[32mtrue\u001B[0m\n  migrationStatus: \u001B[32mcomplete\u001B[0m\n');
      });
    });

    describe('create, migrate, clear command tests', () => {
      test('migrate , but not specificied module name', async () => {
        process.argv.push('--migrate');

        userMigrateDbSpy.mockReset();
        userMigrationStatusSpy.mockReset();

        postMigrateDbSpy.mockReset();
        postMigrationStatusSpy.mockReset();

        outputSpy.mockClear();

        await sut.run();

        expect(userMigrateDbSpy).toBeCalledTimes(0);
        expect(userMigrationStatusSpy).toBeCalledTimes(0);

        expect(postMigrateDbSpy).toBeCalledTimes(0);
        expect(postMigrationStatusSpy).toBeCalledTimes(0);

        expect(outputSpy).toBeCalledTimes(1);
        expect(outputSpy.mock.calls[0][0]).toContain('Не указана опция --module. Для справки наберите: \u001b[32m--help migrate\u001b[0m');
      });
      test('migrate user and post module, but user db skiped and post db need partially migrate', async () => {
        process.argv.push('--migrate', '--module', 'PostModule UserModule');

        userMigrateDbSpy.mockReset();
        userMigrateDbSpy.mockImplementationOnce(() => {});
        userMigrationStatusSpy.mockReset();
        userMigrationStatusSpy.mockImplementationOnce(() => 'complete'); // not need migrate

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
          process.argv.push(`--${command}`, '--module', 'UserModule');
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
          const [
            command, eventStr, userDbMethod, userDbStatusMethod,
          ] = [...userMethodsTestTuples[i]];
          const [_, __, postDbMethod, postDbStatusMethod] = [...postMethodsTestTuples[i]];
          process.argv = [...argv];
          process.argv.push(`--${command}`, '--module', 'UserModule  PostModule');

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
      expect(outputSpy.mock.calls[0][0]).toBe('Вы не указали sql method. Будет использоваться метод по умолчанию: \u001b[32mall\u001b[0m');
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
