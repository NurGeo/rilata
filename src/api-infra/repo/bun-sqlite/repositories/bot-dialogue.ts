import { BotDialogueRepository } from '#api/bot/dialogue-repo.js';
import { DialogueContext, FinishContextAttrs, UpdateContextAttrs } from '#api/bot/types.js';
import { dtoUtility } from '#core/utils/dto/dto-utility.js';
import { DTO } from '#domain/dto.js';
import { BunSqliteRepository } from '../repository.ts';
import { MigrateRow } from '../types.ts';

type BotDialogueContextRecord = {
  telegramId: string,
  isActive: 1 | 0,
  stateName: string,
  lastUpdate: number,
  payload: string,
}

type RunResult = {
  changes: number,
  lastInsertRowid: number,
}

export class BotDialogueRepositorySqlite<CTX extends DialogueContext<DTO, string>>
  extends BunSqliteRepository<'bot_dialogues', DialogueContext<DTO, string>>
  implements BotDialogueRepository<false, CTX> {
  tableName = 'bot_dialogues' as const;

  migrationRows: MigrateRow[] = [];

  cache: Record<string, DialogueContext<DTO, string>> = {};

  create(): void {
    this.db.sqliteDb.run(
      `CREATE TABLE ${this.tableName} (
        telegramId TEXT NOT NULL,
        isActive INTEGER NOT NULL CHECK (isActive IN (0, 1)),
        stateName TEXT NOT NULL,
        lastUpdate INTEGER NOT NULL,
        payload JSON NOT NULL
      );
      CREATE INDEX botDialogueTelegamIdIndex ON ${this.tableName} (telegramId);`,
    );
  }

  findAll(telegramId: string): CTX[] {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE telegramId = ?
    `;
    const records = this.db.sqliteDb.query(query).all(telegramId) as BotDialogueContextRecord[];
    const contexts = records.map((rec) => (
      dtoUtility.hardReplaceAttrs(
        rec,
        {
          isActive: Boolean(rec.isActive),
          payload: JSON.parse(rec.payload),
        },
      )
    )) as CTX[];
    contexts.forEach((ctx) => (ctx.isActive ? this.addToCache(ctx) : undefined));
    return contexts;
  }

  findActive(telegramId: string): CTX | undefined {
    const cachedCtx = this.getFromCache(telegramId);
    if (cachedCtx && cachedCtx.isActive) return cachedCtx as CTX;

    const query = `
      SELECT * FROM ${this.tableName}
      WHERE telegramId = ? AND isActive = 1
    `;
    const queredCtx = this.db.sqliteDb.query(query).get(telegramId) as BotDialogueContextRecord;
    if (!queredCtx) return undefined;
    const ctx = dtoUtility.hardReplaceAttrs(
      queredCtx,
      {
        isActive: Boolean(queredCtx.isActive),
        payload: JSON.parse(queredCtx.payload),
      },
    ) as CTX;
    this.addToCache(ctx);
    return ctx;
  }

  add(context: Omit<CTX, 'isActive' | 'lastUpdate'>): void {
    const { telegramId } = context;

    const existingContext = this.findActive(telegramId);
    if (existingContext) {
      throw new Error(`Активный контекст диалога уже существует для пользователя с telegramId: ${telegramId}`);
    }

    const recordContext = dtoUtility.extendAttrs(
      context,
      { isActive: 1, lastUpdate: this.getNow(), payload: JSON.stringify(context.payload) },
    );
    const query = `
      INSERT INTO ${this.tableName}
      VALUES ($telegramId, $isActive, $stateName, $lastUpdate, json($payload))
    `;
    this.db.sqliteDb.query(query).run(this.getObjectBindings(recordContext));
  }

  clear(): void {
    this.cache = {};
    super.clear();
  }

  protected getFieldNames(names: string[]): string {
    return names.reduce(
      (total, nm, idx) => (idx === (names.length - 1) ? `${total}${nm}` : `${total}${nm}, `),
      '',
    );
  }

  protected getBindingFieldNames(names: string[]): string {
    return names.reduce(
      (total, nm, idx) => (idx === (names.length - 1) ? `${total}$${nm}` : `${total}$${nm}, `),
      '',
    );
  }

  updateContext(telegramId: string, attrs: UpdateContextAttrs): void {
    this.updateRecord(telegramId, attrs);
  }

  finishContext(telegramId: string, attrs: FinishContextAttrs): void {
    this.updateRecord(telegramId, { ...attrs, isActive: false });
  }

  protected updateRecord(
    telegramId: string,
    attrs: UpdateContextAttrs & { isActive?: boolean },
  ): void {
    const updateData = dtoUtility.extendAttrs(attrs, { lastUpdate: this.getNow() });
    const updateAttrs = Object.keys(updateData);
    const query = `
      UPDATE ${this.tableName}
      SET (${this.getFieldNames(updateAttrs)}) = (${this.getBindingFieldNames(updateAttrs)})
      WHERE telegramId=$telegramId AND isActive=1
    `;
    const bindData = dtoUtility.extendAttrs(updateData, { telegramId });
    const record = updateAttrs.includes('payload')
      ? dtoUtility.hardReplaceAttrs(bindData, { payload: JSON.stringify(updateData.payload) })
      : bindData;

    const db = this.db.sqliteDb;
    this.removeFromCache(telegramId);
    try {
      db.exec('BEGIN TRANSACTION');
      const result = db
        .prepare(query)
        .run(this.getObjectBindings(record)) as unknown as RunResult;

      if (result.changes === 1) {
        db.exec('COMMIT');
      } else if (result.changes === 0) {
        throw new Error(`Нет активного контекста диалога для пользователя с telegramId: ${telegramId}`);
      } else {
        throw new Error(`У пользователя с telegramId: ${telegramId} есть несколько активных записей`);
      }
      this.removeFromCache(telegramId);
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  getNow(): number {
    return Date.now();
  }

  protected getFromCache(telegramId: string): DialogueContext<DTO, string> | undefined {
    return this.cache[telegramId];
  }

  protected addToCache(context: DialogueContext<DTO, string>): void {
    this.cache[context.telegramId] = context;
  }

  protected removeFromCache(telegramId: string): void {
    delete this.cache[telegramId];
  }
}
