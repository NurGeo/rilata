import { ActionDod } from '../../domain/domain-object-data/common-types';
import { Caller } from '../caller';
import { Module } from '../module/module';
import { ModuleType } from '../module/types';
import { InternalError, UseCaseBaseErrors } from '../use-case/error-types';
import { InputOptions } from '../use-case/types';
import { dodUtility } from '../../common/utils/domain-object/dod-utility';
import { Locale } from '../../domain/locale';

type ExpressResponse = {
  status(status: number): ExpressResponse,
  send(payload: unknown): ExpressResponse,
}

export abstract class Controller {
  STATUS_CODES: Record<UseCaseBaseErrors['name'], number> = {
    'Not Found': 404,
    'Permission denied': 403,
    'Internal error': 500,
    'Bad Request': 400,
    'Validation Error': 400,
  };

  constructor(protected module: Module<ModuleType>, protected runMode: string) {}

  protected async executeUseCase(
    actionDod: ActionDod,
    caller: Caller,
    response: ExpressResponse,
  ): Promise<void> {
    try {
      const { actionName } = actionDod;
      const useCase = this.module.getUseCaseByName(actionName as string);
      const inputOptions: InputOptions<ActionDod> = {
        actionDod,
        caller,
      };

      const useCaseResult = await useCase.execute(inputOptions);

      if (useCaseResult.isSuccess() === true) {
        response.status(200);
      } else if (useCaseResult.isFailure()) {
        const err = useCaseResult.value as UseCaseBaseErrors;
        response.status(this.STATUS_CODES[err.name]);
      }

      response.send({
        success: useCaseResult.isSuccess(),
        payload: useCaseResult.value,
      });
    } catch (e) {
      if (this.runMode.includes('test')) {
        throw e;
      }
      this.module.getLogger().fatalError('server internal error', { actionDod, caller });
      const err = dodUtility.getAppErrorByType<InternalError<Locale>>(
        'Internal error',
        'Извините, на сервере произошла ошибка',
        {},
      );

      response.send({
        success: false,
        payload: err,
      });
    }
  }
}
