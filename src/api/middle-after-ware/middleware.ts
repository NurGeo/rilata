import { GeneralModuleResolver } from '../base.index.js';
import { RilataRequest } from '../controller/types.js';
import { GeneralServerResolver } from '../server/types.js';

export abstract class Middleware<R extends GeneralServerResolver | GeneralModuleResolver> {
  protected resolver!: R;

  init(resolver: R): void {
    this.resolver = resolver;
  }

  /**
    Предварительная обработка всех запросов.
    Если вернет Response, то ответ получен и запрос дальше не пойдет.
  */
  abstract process(req: RilataRequest): Response | undefined
}
