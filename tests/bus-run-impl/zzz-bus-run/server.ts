import { GeneralServerResolver } from '../../../src/api/base.index.js';
import { Controller } from '../../../src/api/controller/controller.js';
import { Afterware } from '../../../src/api/http.index.js';
import { LogResponseAfterware } from '../../../src/api/middle-after-ware/afterwares/log-request.js';
import { Middleware } from '../../../src/api/middle-after-ware/middleware.js';
import { InjectCallerMiddleware } from '../../../src/api/middle-after-ware/middlewares/inject-caller.js';
import { BusBunServer } from '../../../src/api/server/bus-server.js';

export class BusRunServer extends BusBunServer {
  protected middlewares: Middleware<GeneralServerResolver>[] = [
    new InjectCallerMiddleware(),
  ];

  protected afterwares: Afterware<GeneralServerResolver>[] = [
    new LogResponseAfterware(),
  ];

  protected serverControllers: Controller<GeneralServerResolver>[] = [];
}
