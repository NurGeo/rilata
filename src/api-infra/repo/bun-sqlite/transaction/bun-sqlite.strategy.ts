import { requestStoreDispatcher } from '#api/request-store/request-store-dispatcher.js';
import { TransactionStrategy } from '#api/service/transaction-strategy/strategy.js';
import { BunSqliteDatabase } from '../database.js';

export class BunSqliteStrategy extends TransactionStrategy {
  protected executeWithTransaction<
    IN, RET, S extends { runDomain:(input: IN) => RET }
  >(service: S, input: IN): RET {
    const store = requestStoreDispatcher.getPayload();
    const db = store.moduleResolver.getDatabase() as BunSqliteDatabase;
    const transactionFn = db.sqliteDb.transaction(() => service.runDomain(input));
    return transactionFn();
  }
}

export const bunSqliteStrategy = new BunSqliteStrategy();
