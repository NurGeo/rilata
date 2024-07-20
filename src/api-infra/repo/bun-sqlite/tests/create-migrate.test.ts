/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, beforeEach, spyOn } from 'bun:test';
import { MigrateRow } from '../types.js';
import { SqliteTestFixtures } from './fixtures.js';
import { dtoUtility } from '#core/utils/dto/dto-utility.js';

describe('sqlite create and migrate tests', () => {
  const fakeModuleResolver = SqliteTestFixtures.getResolverWithTestDb();
  const db = fakeModuleResolver.getDatabase() as SqliteTestFixtures.TestBunSqliteDatabase;
  beforeEach(() => {
    db.clear();
  });

  test('успех. бд и таблицы созданы', () => {
    const tableNamesAsArrObj = db.sqliteDb.query('SELECT name FROM sqlite_master WHERE type="table"').all();
    const tableNames = tableNamesAsArrObj.map((tName) => (tName as any).name);
    expect(tableNames).toEqual(['migrations', 'users', 'posts', 'events']);
  });

  test('успех, поля таблицы migrations добавлены', () => {
    const migrColAsArrObj = db.sqliteDb.query('PRAGMA table_info("migrations")').all();
    const migrColNames = migrColAsArrObj.map((col) => (col as any).name);
    expect(migrColNames).toEqual(['id', 'description', 'sql', 'tableName', 'migratedAt']);
  });

  test('успех, поля таблицы events добавлены', () => {
    const colAsArrObj = db.sqliteDb.query('PRAGMA table_info("events")').all();
    const colNames = colAsArrObj.map((col) => (col as any).name);
    expect(colNames).toEqual(['id', 'name', 'payload', 'requestId', 'isPublished', 'aRootName', 'aRootId']);
  });

  test('успех, поля таблицы users добавлены', () => {
    const colAsArrObj = db.sqliteDb.query('PRAGMA table_info("users")').all();
    const colNames = colAsArrObj.map((col) => (col as any).name);
    expect(colNames).toEqual(['userId', 'login', 'hash', 'posts']);
  });

  test('успех, поля таблицы posts добавлены, миграция сработала', () => {
    const postColAsArrObj = db.sqliteDb.query('PRAGMA table_info("posts")').all();
    const postColNames = postColAsArrObj.map((col) => (col as any).name);
    expect(postColNames).toEqual(['postId', 'name', 'body', 'desc', 'authorId', 'published', 'version', 'category']);

    const migrations = db.sqliteDb.query('SELECT * FROM migrations').all();
    expect(migrations.length).toBe(1);
    expect((migrations as MigrateRow[])[0].id).toBe('9c3b4923-20e3-4d29-bf37-8170103d49c0');
  });

  test('провал, тест транзакции, запись миграции в таблицу posts, migrations не проходит из за ошибки записи в таблицу migrations', () => {
    const failDb = new SqliteTestFixtures.TestBunSqliteDatabase([
      SqliteTestFixtures.UserRepositorySqlite,
      SqliteTestFixtures.PostRepositorySqlite,
    ]);
    const migrationRepo = failDb.getMigrationRepo();
    const registerMigrationSpy = spyOn(migrationRepo, 'registerMigration');
    registerMigrationSpy.mockImplementationOnce((migration: MigrateRow, tableName: string) => {
      const row = dtoUtility.extendAttrs(migration, { tableName });
      const migrationRecordSql = `
        INSERT INTO migrations
        VALUES (?, ?, ?, ?, null)
      `;
      failDb.sqliteDb.prepare(migrationRecordSql).run(row.id, row.description, row.sql, tableName);
    });
    try {
      failDb.init(fakeModuleResolver);
      throw Error('not be called');
    } catch (e) {
      expect(String(e)).toBe('Error: fail migrate "add post category column" row');
    }

    const postColAsArrObj = failDb.sqliteDb.query('PRAGMA table_info("posts")').all();
    const postColNames = postColAsArrObj.map((col) => (col as any).name);
    // not added column
    expect(postColNames).toEqual(['postId', 'name', 'body', 'desc', 'authorId', 'published', 'version']);

    const migrations = failDb.sqliteDb.query('SELECT * FROM migrations').all();
    // not added in migrations table
    expect(migrations.length).toBe(0);
  });

  test('успех, повторное выполнение миграции не приводит к эффекту', () => {
    function checkMigrate(): void {
      const sql = 'SELECT id FROM migrations';
      const migrationRecords = db.sqliteDb.query(sql).all();
      expect(migrationRecords.length).toBe(1);
      expect(migrationRecords).toEqual([
        { id: '9c3b4923-20e3-4d29-bf37-8170103d49c0' },
      ]);
    }

    checkMigrate();
    db.migrateDb();
    checkMigrate();
  });
});
