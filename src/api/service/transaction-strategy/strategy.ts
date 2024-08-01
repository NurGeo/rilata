import { CommandRequestStorePayload } from '#api/request-store/types.js';
import { DatabaseObjectSavingError, OptimisticLockVersionMismatchError } from '../../../core/exeptions.js';
import { Logger } from '../../../core/logger/logger.js';
import { requestStore } from '../../request-store/request-store.js';

export abstract class TransactionStrategy {
  /** Ответственнен за выполнение транзацкии */
  protected abstract executeWithTransaction<
    IN, RET, S extends { runDomain:(input: IN) => RET | Promise<RET> }
  >(service: S, input: IN): RET | Promise<RET>

  /** Запускает доменный слой, перезапускает в случае получения ошибок БД. */
  async executeDatabaseScope<
    IN, RET, S extends { runDomain:(input: IN) => RET | Promise<RET> }
  >(service: S, input: IN): Promise<RET> {
    const storePayload = this.requestPayloadToCommandPayload();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await this.executeWithTransaction(service, input) as RET | Promise<RET>;
        return result;
      } catch (e) {
        const { caller } = storePayload;
        if (e instanceof OptimisticLockVersionMismatchError) {
          this.getLogger().warning(
            'Произошла оптимистичная блокировка БД, пробуем перезапуститься...',
            { errorDesctiption: String(e), input, caller },
          );
        } else if (e instanceof DatabaseObjectSavingError) {
          if (storePayload.databaseErrorRestartAttempts === 0) {
            this.getLogger().error(
              'Произошла ошибка БД, перезапуск не помог, прокидываем ошибку дальше...',
              { errorDesctiption: String(e), input, caller },
              e,
            );
            throw e;
          }
          this.getLogger().warning(
            'Произошла ошибка БД, пробуем перезапуститься...',
            { errorDesctiption: String(e), input, caller },
          );
          storePayload.databaseErrorRestartAttempts -= 1;
        } else {
          throw e;
        }
      }
    }
  }

  protected requestPayloadToCommandPayload(): CommandRequestStorePayload {
    const payloadToExtend = requestStore.getPayload<CommandRequestStorePayload>();
    payloadToExtend.type = 'commandRequest';
    // разрешить перезапуститься 1 раз, если возникла ошибка в БД.
    (payloadToExtend).databaseErrorRestartAttempts = 1;
    return payloadToExtend;
  }

  protected getLogger(): Logger {
    return requestStore.getPayload().logger;
  }
}
