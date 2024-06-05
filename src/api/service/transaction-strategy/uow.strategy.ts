import { Result } from '../../../core/result/types.js';
import { UnitOfWorkDatabase } from '../../database/transaction/uow.database.js';
import { requestStoreDispatcher } from '../../request-store/request-store-dispatcher.js';
import { TransactionStrategy } from './strategy.js';

export class UowTransactionStrategy<ASYNC extends boolean>
  extends TransactionStrategy {
  constructor(protected asyncRepo: ASYNC) {
    super();
  }

  protected async executeWithTransaction<
    IN, RET, S extends { runDomain:(input: IN) => RET | Promise<RET> }
  >(service: S, input: IN): Promise<RET> {
    const requestStorePayload = requestStoreDispatcher.getPayload();
    const db = requestStorePayload.moduleResolver.getDatabase() as UnitOfWorkDatabase<ASYNC>;
    const unitOfWorkId = (this.asyncRepo
      ? await db.startTransaction()
      : db.startTransaction()) as string;
    requestStorePayload.unitOfWorkId = unitOfWorkId;

    try {
      const res = this.asyncRepo
        ? await service.runDomain(input) as Result<unknown, unknown>
        : service.runDomain(input) as Result<unknown, unknown>;
      if (res.isSuccess()) {
        this.asyncRepo ? await db.commit(unitOfWorkId) : db.commit(unitOfWorkId);
      } else {
        this.asyncRepo ? await db.rollback(unitOfWorkId) : db.rollback(unitOfWorkId);
      }

      requestStorePayload.unitOfWorkId = undefined;
      return res as RET;
    } catch (e) {
      this.asyncRepo ? await db.rollback(unitOfWorkId) : db.rollback(unitOfWorkId);
      requestStorePayload.unitOfWorkId = undefined;
      throw e;
    }
  }
}
