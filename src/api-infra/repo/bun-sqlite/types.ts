import { UuidType } from '#core/types.js';
import { DTO } from '#domain/dto.js';
import { BunSqliteDatabase } from './database.js';
import { BunSqliteRepository } from './repository.js';

export type MigrateRow = {
  id: UuidType,
  description: string,
  sql: string,
};

export type MigratinsRecord = MigrateRow & {
  tableName: string,
  migratedAt: number,
}

export type BunSqliteTransactionData = {
  cb: () => void;
  transactionId: UuidType,
  transactioinDescription: string,
  repositoryName: string,
}

export type BunRepoCtor = new (db: BunSqliteDatabase) => BunSqliteRepository<string, DTO>;

export type BotDialogueContextRecord = {
  telegramId: string,
  isActive: 1 | 0,
  stateName: string,
  lastUpdate: number,
  payload: string,
}
