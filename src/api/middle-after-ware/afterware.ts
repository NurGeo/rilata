import { RilataRequest } from '../controller/types.js';
import { GeneralModuleResolver } from '../module/types.js';
import { GeneralServerResolver } from '../server/types.js';

export abstract class Afterware<R extends GeneralServerResolver | GeneralModuleResolver> {
  protected resolver!: R;

  init(resolver: R): void {
    this.resolver = resolver;
  }

  /** Постобработка всех запросов. */
  abstract process(req: RilataRequest, resp: Response): Response
}
