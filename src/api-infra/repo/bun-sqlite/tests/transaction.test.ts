import { beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { requestStoreMock } from 'tests/fixtures/request-store-mock.js';
import { DomainUser } from '#api/controller/types.js';
import { EventRepository } from '#api/database/event.repository.js';
import { dodUtility } from '#core/utils/dod/dod-utility.js';
import { uuidUtility } from '#core/utils/uuid/uuid-utility.js';
import { SqliteTestFixtures } from './fixtures.js';

describe('bun sqlite db transaction tests', () => {
  const fakeModuleResolver = SqliteTestFixtures.getResolverWithTestDb();
  const db = fakeModuleResolver.getDatabase() as SqliteTestFixtures.BlogDatabase;

  beforeEach(() => {
    db.clear();
  });

  const sut = new SqliteTestFixtures.AddPostService();

  const caller: DomainUser = {
    type: 'DomainUser',
    userId: '08ea51a1-6d14-42bf-81de-a94a809e3286',
  };
  requestStoreMock({
    caller,
    moduleResolver: fakeModuleResolver,
    serviceName: 'AddingPostService',
    moduleName: 'PostModule',
  });

  test('успех, транзакция трех репозиториев проходит успешно', async () => {
    db.clear();
    db.addBatch(SqliteTestFixtures.batchRecords);

    const requestDodAttrs: SqliteTestFixtures.AddPostServiceParams['input']['attrs'] = {
      name: 'Рецензия на пожалуй лучший фильм года "Интерстеллар"',
      body: 'Длинный текст с рецензией на фильм',
      category: 'cinema',
    };
    const requestDod = dodUtility.getRequestDod<
      SqliteTestFixtures.AddPostServiceParams['input']
    >('addPost', requestDodAttrs);

    const result = await sut.execute(requestDod);
    expect(result.isSuccess()).toBe(true);
    const value = result.value as SqliteTestFixtures.AddPostServiceParams['successOut'];
    expect(Object.keys(value)).toEqual(['postId']);
    expect(uuidUtility.isValidValue(value.postId)).toBe(true);

    const postRepo = SqliteTestFixtures.PostRepository.instance(fakeModuleResolver);
    const post = postRepo.findPost(value.postId);
    expect(post).not.toBeUndefined();
    expect((post as SqliteTestFixtures.PostAttrs)).toEqual({
      postId: value.postId,
      name: 'Рецензия на пожалуй лучший фильм года "Интерстеллар"',
      body: 'Длинный текст с рецензией на фильм',
      category: 'cinema',
      authorId: caller.userId,
      published: false,
    });

    const userRepo = SqliteTestFixtures.UserRepository.instance(fakeModuleResolver);
    const user = userRepo.findUser(caller.userId);
    expect(user).not.toBeUndefined();
    expect(user as SqliteTestFixtures.UserAttrs).toEqual({
      userId: '08ea51a1-6d14-42bf-81de-a94a809e3286',
      login: 'Bill',
      hash: 'fff',
      posts: [value.postId],
    });

    const evenRepo = EventRepository.instance<false>(fakeModuleResolver);
    const events = evenRepo.getAggregateEvents(value.postId);
    expect(events.length).toBe(1);
    expect(events).toEqual([
      {
        attrs: { ...requestDodAttrs },
        meta: {
          eventId: events[0].meta.eventId,
          requestId: events[0].meta.requestId,
          name: 'PostAdded',
          moduleName: 'PostModule',
          serviceName: 'AddingPostService',
          domainType: 'event',
          created: events[0].meta.created,
        },
        caller: {
          type: 'DomainUser',
          userId: '08ea51a1-6d14-42bf-81de-a94a809e3286',
        },
        aRoot: {
          attrs: {
            ...requestDodAttrs,
            authorId: '08ea51a1-6d14-42bf-81de-a94a809e3286',
            postId: value.postId,
            published: false,
          },
          meta: {
            name: 'PostAr',
            idName: 'postId',
            domainType: 'aggregate',
            version: 0,
          },
        },
      },
    ]);
  });

  test('провал, первая транзакция происходит, вторая проваливается что приводит к отмене первого', async () => {
    db.clear();
    db.addBatch(SqliteTestFixtures.batchRecords);

    const requestDodAttrs: SqliteTestFixtures.AddPostServiceParams['input']['attrs'] = {
      name: 'Рецензия на пожалуй лучший фильм года "Интерстеллар"',
      body: 'heh',
      category: 'cinema',
    };
    const requestDod = dodUtility.getRequestDod<
      SqliteTestFixtures.AddPostServiceParams['input']
    >('addPost', requestDodAttrs);

    const userRepo = SqliteTestFixtures.UserRepository.instance(fakeModuleResolver);
    const userAddPostSpy = spyOn(userRepo, 'addPost');
    const postRepo = SqliteTestFixtures.PostRepository.instance(fakeModuleResolver);
    const postAddPostSpy = spyOn(postRepo, 'addPost');
    const eventRepo = EventRepository.instance(fakeModuleResolver);
    const eventAddEventsSpy = spyOn(eventRepo, 'addEvents');
    eventAddEventsSpy.mockReset();

    try {
      await sut.execute(requestDod);
      throw Error('will not be runned');
    } catch (e) {
      expect(String(e)).toContain('CHECK constraint failed: LENGTH(body) > 5');
    }
    expect(userAddPostSpy).toHaveBeenCalledTimes(2);
    expect(userAddPostSpy.mock.calls[0].length).toBe(2);
    expect(postAddPostSpy).toHaveBeenCalledTimes(2);
    expect(postAddPostSpy.mock.calls[0].length).toBe(1);
    expect(eventAddEventsSpy).toHaveBeenCalledTimes(0);

    const user = userRepo.findUser(caller.userId);
    expect(user).toEqual({
      userId: caller.userId,
      login: 'Bill',
      hash: 'fff',
      posts: [],
    });

    const posts = postRepo.findUserPosts(caller.userId);
    expect(posts.length).toBe(0);
  });
});
