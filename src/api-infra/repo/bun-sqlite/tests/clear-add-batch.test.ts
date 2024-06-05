/* eslint-disable no-useless-escape */
import { beforeEach, describe, expect, test } from 'bun:test';
import { SqliteTestFixtures } from './fixtures.js';

describe('bun sqlite db: add batch to db, and clear db tests', () => {
  const fakeModuleResolver = SqliteTestFixtures.getResolverWithTestDb();
  const db = fakeModuleResolver.getDatabase() as SqliteTestFixtures.BlogDatabase;
  beforeEach(() => {
    db.clear();
  });

  describe('add batch to db tests', () => {
    test('успех, данные добавлены', () => {
      const usersBefore = db.sqliteDb.query('SELECT * FROM users').all();
      expect(usersBefore.length).toBe(0);
      const postsBefore = db.sqliteDb.query('SELECT * FROM posts').all();
      expect(postsBefore.length).toBe(0);

      db.addBatch(SqliteTestFixtures.batchRecords);

      const usersAfter = db.sqliteDb.query('SELECT * FROM users').all();
      expect(usersAfter).toEqual([
        {
          userId: '08ea51a1-6d14-42bf-81de-a94a809e3286',
          login: 'Bill',
          hash: 'fff',
          posts: '[]',
        }, {
          userId: '38d929f5-d20d-47f3-8844-eb1986ee46ae',
          login: 'f1rstFx',
          hash: 'hhh',
          posts: '[\"3ee45022-4253-4dbe-9da0-80db931184cc\"]',
        }, {
          userId: '131b499e-927d-477c-9d97-c2ae6104985e',
          login: 'Nick',
          hash: 'ccc',
          posts: '[\"09cdf3d6-93ef-44be-8a3d-2e9da3982049\",\"fb369b27-ec5e-452f-b454-e48db4bf6ab4\"]',
        },
      ]);
      const postsAfter = db.sqliteDb.query('SELECT * FROM posts').all();
      expect(postsAfter).toEqual([
        {
          postId: '09cdf3d6-93ef-44be-8a3d-2e9da3982049',
          name: 'About thinks',
          body: 'very long text about thinks',
          desc: null,
          authorId: '131b499e-927d-477c-9d97-c2ae6104985e',
          published: 1,
          version: 0,
          category: 'cinema',
        }, {
          postId: '3ee45022-4253-4dbe-9da0-80db931184cc',
          name: 'Film Interstellar',
          body: 'long recense',
          desc: 'very nice film',
          authorId: '38d929f5-d20d-47f3-8844-eb1986ee46ae',
          published: 0,
          version: 0,
          category: 'cinema',
        }, {
          postId: 'fb369b27-ec5e-452f-b454-e48db4bf6ab4',
          name: 'Avatar not cool film, imho',
          body: 'long recense',
          desc: null,
          authorId: '131b499e-927d-477c-9d97-c2ae6104985e',
          published: 0,
          version: 0,
          category: 'cinema',
        },
      ]);
    });

    test('успех, значени по умолчанию тоже ставятся', () => {
      const usersBefore = db.sqliteDb.query('SELECT * FROM users').all();
      expect(usersBefore.length).toBe(0);
      const postsBefore = db.sqliteDb.query('SELECT * FROM posts').all();
      expect(postsBefore.length).toBe(0);

      db.addBatch<SqliteTestFixtures.PostRepositorySqlite>({
        posts: [
          {
            postId: '09cdf3d6-93ef-44be-8a3d-2e9da3982049',
            name: 'About thinks',
            body: 'very long text about thinks',
            authorId: '131b499e-927d-477c-9d97-c2ae6104985e',
          } as SqliteTestFixtures.PostRecord,
        ],
      });
      const postsAfter = db.sqliteDb.query('SELECT * FROM posts').all();
      expect(postsAfter).toEqual([
        {
          authorId: '131b499e-927d-477c-9d97-c2ae6104985e',
          body: 'very long text about thinks',
          category: 'music',
          desc: null,
          name: 'About thinks',
          postId: '09cdf3d6-93ef-44be-8a3d-2e9da3982049',
          published: 0,
          version: 0,
        },
      ]);
    });
  });

  describe('clear db tests', () => {
    beforeEach(() => {
      db.clear();
    });

    test('успех, бд полностью очищена, но таблица миграции не затрагивается', () => {
      const usersBefore = db.sqliteDb.query('SELECT * FROM users').all();
      expect(usersBefore.length).toBe(0);
      const postsBefore = db.sqliteDb.query('SELECT * FROM posts').all();
      expect(postsBefore.length).toBe(0);
      const eventsBefore = db.sqliteDb.query('SELECT * FROM events').all();
      expect(eventsBefore.length).toBe(0);
      const migrationsBefore = db.sqliteDb.query('SELECT * FROM migrations').all();
      expect(migrationsBefore.length).toBe(1);

      db.addBatch(SqliteTestFixtures.batchRecords);

      const usersAfterBatch = db.sqliteDb.query('SELECT * FROM users').all();
      expect(usersAfterBatch.length).toBe(3);
      const postsAfterBatch = db.sqliteDb.query('SELECT * FROM posts').all();
      expect(postsAfterBatch.length).toBe(3);
      const eventsAfterBatch = db.sqliteDb.query('SELECT * FROM events').all();
      expect(eventsAfterBatch.length).toBe(0);
      const migrationsAfterBatch = db.sqliteDb.query('SELECT * FROM migrations').all();
      expect(migrationsAfterBatch.length).toBe(1);

      db.clear();

      const usersAfterClear = db.sqliteDb.query('SELECT * FROM users').all();
      expect(usersAfterClear.length).toBe(0);
      const postsAfterClear = db.sqliteDb.query('SELECT * FROM posts').all();
      expect(postsAfterClear.length).toBe(0);
      const migrationsAfterClear = db.sqliteDb.query('SELECT * FROM migrations').all();
      expect(migrationsAfterClear.length).toBe(1);
    });
  });
});
