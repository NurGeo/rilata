import { describe, test, expect, spyOn, beforeEach } from 'bun:test';
import { SqliteTestFixtures } from './fixtures.ts';
import { BotDialogueRepositorySqlite } from '../repositories/bot-dialogue.ts';
import { BunSqliteDatabase } from '../database.ts';
import { DialogueContext } from '#api/bot/types.js';
import { dtoUtility } from '#core/utils/dto/dto-utility.js';
import { BotDialogueContextRecord } from '../types.ts';

type TestContextData = {
  data: string[],
}

type TestStates = 'inited' | 'updated' | 'finished';

type TestDialogueContext = DialogueContext<TestContextData, TestStates>

const fixtures: Record<'bot_dialogues', BotDialogueContextRecord[]> = {
  bot_dialogues: [
    {
      telegramId: '12345',
      isActive: 0,
      stateName: 'finished',
      lastUpdate: Date.now(),
      payload: JSON.stringify({
        data: ['test data'],
      }),
    },
    {
      telegramId: '67890',
      isActive: 0,
      stateName: 'finished' as const,
      lastUpdate: Date.now(),
      payload: JSON.stringify({
        data: ['test data', 'other data'],
      }),
    },
    {
      telegramId: '12345',
      isActive: 1,
      stateName: 'inited' as const,
      lastUpdate: Date.now(),
      payload: JSON.stringify({
        data: ['some data'],
      }),
    },
  ],
};

function recordToAttrs(
  rec: BotDialogueContextRecord,
  part?: Partial<BotDialogueContextRecord>,
): TestDialogueContext {
  return {
    ...rec,
    isActive: Boolean(part?.isActive ? part.isActive : rec.isActive),
    payload: part?.payload ? JSON.parse(part.payload) : JSON.parse(rec.payload),
    ...(dtoUtility.excludeAttrs(part ?? {}, ['isActive', 'payload'])),
  } as TestDialogueContext;
}

class JsonableBotDialogueRepository extends BotDialogueRepositorySqlite<TestDialogueContext> {
  pushNumberForJson(
    telegramId: string,
    data: string,
  ): void {
    const query = `
      UPDATE ${this.tableName}
      SET payload = json_insert(payload,'$.data[#]','${data}')
      WHERE telegramId = ? AND isActive = 1
    `;
    this.db.sqliteDb.prepare(query).run(telegramId);
  }
}

const fakeResolver = SqliteTestFixtures.getResolverWithTestDb([JsonableBotDialogueRepository]);
const db = fakeResolver.getDatabase() as BunSqliteDatabase;
const repo = db.getRepository<JsonableBotDialogueRepository>('bot_dialogues');

describe('BotDialogueRepositorySqlite', () => {
  beforeEach(() => {
    db.clearDb();
  });

  test('add should add new context and throw error if active context exists', async () => {
    const now = Date.now();
    spyOn(repo, 'getNow').mockReturnValue(now);
    const context1 = {
      ...fixtures.bot_dialogues[0],
      isActive: undefined,
      lastUpdate: undefined,
      payload: JSON.parse(fixtures.bot_dialogues[0].payload) as TestContextData,
    };
    const context2 = {
      ...fixtures.bot_dialogues[2],
      isActive: undefined,
      lastUpdate: undefined,
      payload: JSON.parse(fixtures.bot_dialogues[2].payload) as TestContextData,
    };

    repo.add(context1 as Omit<TestDialogueContext, 'isActive' | 'lastUpdate'>); // isActive === true
    const findContext = repo.findActive(context1.telegramId);
    expect(findContext).not.toBeUndefined();
    const expectContext1 = recordToAttrs(
      fixtures.bot_dialogues[0], { isActive: 1, lastUpdate: now },
    );
    expect(findContext).toEqual(expectContext1);

    expect(() => repo.add(context2 as Omit<TestDialogueContext, 'isActive' | 'lastUpdate'>)).toThrow(
      `Активный контекст диалога уже существует для пользователя с telegramId: ${context2.telegramId}`,
    );
  });

  test('findActive should find active contexts for user by telegramId', async () => {
    db.addBatch(fixtures);

    const user1Context = repo.findActive(fixtures.bot_dialogues[0].telegramId);
    const user1ExpectContext = recordToAttrs(fixtures.bot_dialogues[2]); // last context is active;
    expect(user1Context).toEqual(user1ExpectContext);
    const user2Context = repo.findActive(fixtures.bot_dialogues[1].telegramId);
    expect(user2Context).toBeUndefined();
  });

  test('findAll should find all contexts for user by telegramId', async () => {
    db.addBatch(fixtures);

    const user1Contexts = repo.findAll(fixtures.bot_dialogues[0].telegramId);
    const user1ExpectContexts = [
      recordToAttrs(fixtures.bot_dialogues[0]),
      recordToAttrs(fixtures.bot_dialogues[2]),
    ];
    expect(user1Contexts).toEqual(user1ExpectContexts);
    const user2Contexts = repo.findAll(fixtures.bot_dialogues[1].telegramId);
    const user2ExpectContexts = [
      recordToAttrs(fixtures.bot_dialogues[1]),
    ];
    expect(user2Contexts).toEqual(user2ExpectContexts);
  });

  test('add should throw error for missing required fields', async () => {
    const invalidContext = {
      telegramId: '111',
      payload: {
        data: [],
      },
    } as unknown as Omit<TestDialogueContext, 'lastUpdate' | 'isActive'>;

    expect(() => repo.add(invalidContext)).toThrow(
      /NOT NULL constraint failed: bot_dialogues.stateName/,
    );
  });

  describe('update method tests', () => {
    const now = Date.now();
    const addcontext: Omit<TestDialogueContext, 'lastUpdate' | 'isActive'> = {
      telegramId: '333',
      stateName: 'inited',
      payload: { data: [] },
    };
    const expectContext: TestDialogueContext = {
      ...addcontext,
      stateName: 'updated',
      payload: { data: ['updated data'] },
      isActive: true,
      lastUpdate: now + 5,
    };
    const notActiveContext: TestDialogueContext = {
      ...addcontext,
      stateName: 'updated',
      payload: { data: ['updated data'] },
      isActive: false,
      lastUpdate: now + 5,
    };

    test('should updated stateName and payload', async () => {
      spyOn(repo, 'getNow').mockReturnValue(now);
      repo.add(addcontext);
      spyOn(repo, 'getNow').mockReturnValue(now + 5);
      repo.updateContext('333', {
        payload: { data: ['updated data'] },
        stateName: 'updated',
      });

      const findContext = repo.findActive('333');
      expect(findContext).toEqual(expectContext);
    });

    test('should updated only stateName', async () => {
      spyOn(repo, 'getNow').mockReturnValue(now);
      repo.add(addcontext);
      spyOn(repo, 'getNow').mockReturnValue(now + 5);
      repo.updateContext('333', {
        stateName: 'updated',
      });

      const onlyStateNameExpectContext = {
        ...expectContext,
        payload: { data: [] },
      };
      const findContext = repo.findActive('333');
      expect(findContext).toEqual(onlyStateNameExpectContext);
    });

    test('should updated only payload', async () => {
      spyOn(repo, 'getNow').mockReturnValue(now);
      repo.add(addcontext);
      spyOn(repo, 'getNow').mockReturnValue(now + 5);
      repo.updateContext('333', {
        payload: { data: ['updated data'] },
      });

      const onlyPayloadExpectContext = {
        ...expectContext,
        stateName: 'inited' as const,
      };
      const findContext = repo.findActive('333');
      expect(findContext).toEqual(onlyPayloadExpectContext);
    });

    test('should throw for update at unactive dialogue', async () => {
      const record: BotDialogueContextRecord = {
        ...notActiveContext,
        isActive: notActiveContext.isActive ? 1 : 0,
        payload: JSON.stringify(notActiveContext.payload),
      };
      repo.addBatch([record]);
      expect(repo.findAll('333')).toEqual([notActiveContext]);
      expect(repo.findActive('333')).toBeUndefined();

      const cb = (): void => repo.updateContext('333', { stateName: 'finished' });
      expect(cb).toThrow('Нет активного контекста диалога для пользователя с telegramId: 333');
    });
  });

  describe('finish method tests', () => {
    const now = Date.now();
    const addcontext: Omit<TestDialogueContext, 'lastUpdate' | 'isActive'> = {
      telegramId: '333',
      stateName: 'inited',
      payload: { data: [] },
    };
    const expectContext: TestDialogueContext = {
      ...addcontext,
      stateName: 'finished',
      isActive: false,
      lastUpdate: now + 5,
    };

    test('should finish context and change state', async () => {
      spyOn(repo, 'getNow').mockReturnValue(now);
      repo.add(addcontext);
      spyOn(repo, 'getNow').mockReturnValue(now + 5);
      repo.finishContext('333', { stateName: 'finished' });

      expect(repo.findActive('333')).toBeUndefined();
      expect(repo.findAll('333')).toEqual([expectContext]);
    });

    test('should only finish context', async () => {
      spyOn(repo, 'getNow').mockReturnValue(now);
      repo.add(addcontext);
      spyOn(repo, 'getNow').mockReturnValue(now + 5);
      repo.finishContext('333', {});

      expect(repo.findActive('333')).toBeUndefined();
      const oldStateContext = {
        ...expectContext,
        stateName: 'inited' as const,
      };
      expect(repo.findAll('333')).toEqual([oldStateContext]);
    });

    test('should not finished, not have active context', async () => {
      const record: BotDialogueContextRecord = {
        ...expectContext,
        isActive: expectContext.isActive ? 1 : 0,
        payload: JSON.stringify(expectContext.payload),
      };
      repo.addBatch([record]);
      expect(repo.findAll('333')).toEqual([expectContext]);
      expect(repo.findActive('333')).toBeUndefined();

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const cb = () => repo.finishContext('333', {});
      expect(cb).toThrow('Нет активного контекста диалога для пользователя с telegramId: 333');
    });
  });

  describe('jsonable payload tests', () => {
    test('pushNumberForJson should add number to emotion array for active context', async () => {
      db.addBatch(fixtures);

      repo.pushNumberForJson('12345', 'pushed data');

      const updatedContext = repo.findActive('12345');
      const expectContext = recordToAttrs(fixtures.bot_dialogues[2]);
      expectContext.payload.data.push('pushed data');
      expect(updatedContext).toEqual(expectContext);
    });

    test('pushNumberForJson should not add number for inactive context', async () => {
      db.addBatch(fixtures);
      repo.pushNumberForJson('67890', 'fail');

      const updatedContexts = repo.findAll('67890');
      expect(updatedContexts.length).toBe(1);
      const expectContext = recordToAttrs(fixtures.bot_dialogues[1]);
      expect(updatedContexts[0]).toEqual(expectContext);
    });
  });
});
