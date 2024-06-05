/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { Serve, Server } from 'bun';
import { AsyncLocalStorage } from 'async_hooks';
import { RilataServer } from './server';
import { Controller } from '../controller/controller';
import { ResultDTO, RilataRequest } from '../controller/types';
import { GeneralInternalError, GeneralNotFoundError } from '../service/error-types';
import { GeneralErrorDod } from '../../domain/domain-data/domain-types';
import { GeneralServerResolver } from './types';
import { dodUtility } from '../../core/utils/dod/dod-utility';
import { responseUtility } from '../../core/utils/response/response-utility';
import { Middleware } from '../middle-after-ware/middleware';
import { Afterware } from '../middle-after-ware/afterware';
import { requestStoreDispatcher } from '../request-store/request-store-dispatcher';
import { RequestStorePayload } from '../request-store/types';
import { Constructor, makeInstance } from '../../core/constructor-functions';
import { Module } from '../module/module';

export abstract class BunServer extends RilataServer {
  port: number | undefined;

  hostname: string | undefined;

  protected middlewares: Middleware<GeneralServerResolver>[];

  protected afterwares: Afterware<GeneralServerResolver>[];

  protected serverControllers: Controller<GeneralServerResolver>[];

  protected stringUrls: Record<string, Controller<any>> = {};

  protected regexUrls: [RegExp, Controller<any>][] = [];

  protected server: Server | undefined;

  constructor(
    protected moduleCtors: Constructor<Module>[],
    protected middlewareCtors: Constructor<Middleware<GeneralServerResolver>>[],
    protected afterwareCtors: Constructor<Afterware<GeneralServerResolver>>[],
    protected serverControllerCtors: Constructor<Controller<GeneralServerResolver>>[],
  ) {
    super(moduleCtors.map((Ctor) => makeInstance(Ctor)));
    this.middlewares = middlewareCtors.map((Ctor) => makeInstance(Ctor));
    this.afterwares = afterwareCtors.map((Ctor) => makeInstance(Ctor));
    this.serverControllers = serverControllerCtors.map((Ctor) => makeInstance(Ctor));
  }

  init(serverResolver: GeneralServerResolver): void {
    super.init(serverResolver);
    this.initStarted();

    this.middlewares.forEach((middleware) => middleware.init(serverResolver));
    this.afterwares.forEach((afterware) => afterware.init(serverResolver));
    this.logger.info('all server middle-after-wares loaded');

    this.serverControllers.forEach((controller) => controller.init(this.resolver));
    this.setControllerUrls();
    this.logger.info('all controllers loaded');

    requestStoreDispatcher.setRequestStore(new AsyncLocalStorage<RequestStorePayload>());
    this.logger.info('async local store dispatcher setted');
    this.initFinished();
  }

  stop(): void {
    if (this.server !== undefined) this.server.stop();
    this.logger.info(`Http server stopped by address: ${this.hostname}:${this.port}`);
    super.stop();
  }

  run(): void {
    const { port, hostname } = this.resolver.getServerConfig();
    this.port = port;
    this.hostname = hostname;
    this.fetch = this.fetch.bind(this);
    this.server = Bun.serve(this as unknown as Serve<unknown>);
    this.logger.info(`Http server runned by address: ${this.hostname}:${this.port}`);
  }

  async fetch(req: Request): Promise<Response> {
    try {
      const middlewaresResult = this.processMiddlewares(req);
      if (middlewaresResult !== undefined) {
        return this.processAfterware(req, middlewaresResult);
      }

      const controller = this.getControllerByUrlPath(req);
      if (controller) {
        const resp = await controller.execute(req);
        return this.processAfterware(req, resp);
      }

      const errResp = this.getNotFoundError(new URL(req.url).pathname);
      return this.processAfterware(req, errResp);
    } catch (e) {
      if (this.resolver.getRunMode() === 'test') throw e;
      const errResp = this.getInternalError(req, e as Error);
      return this.processAfterware(req, errResp);
    }
  }

  protected getControllerByUrlPath(req: Request): Controller<any> | undefined {
    const path = new URL(req.url).pathname;
    const controller = this.stringUrls[path];
    if (controller) return controller;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tuple = this.regexUrls.find(([regex, _]) => regex.test(path));
    if (tuple) return tuple[1];
    return undefined;
  }

  protected setControllerUrls(): void {
    const controllers: Controller<any>[] = this.serverControllers;
    this.modules.map((module) => module.getModuleControllers()).forEach((mControllers) => {
      controllers.push(...mControllers);
    });
    controllers.forEach((controller) => {
      controller.getUrls().forEach((url) => {
        if (typeof url === 'string') this.stringUrls[url] = controller;
        else this.regexUrls.push([url, controller]);
      });
    });
  }

  protected processMiddlewares(req: Request): Response | undefined {
    // eslint-disable-next-line no-restricted-syntax
    for (const middleware of this.middlewares) {
      const response = middleware.process(req as RilataRequest);
      if (response !== undefined) return response;
    }
    return undefined;
  }

  protected getNotFoundError(path: string): Response {
    const err = dodUtility.getAppError<GeneralNotFoundError>(
      'Not found',
      'Запрос по адресу: {{url}} не может быть обработана',
      { url: path },
    );
    return this.getFailure(err, 404);
  }

  protected getInternalError(req: Request, e: Error): Response {
    this.logger.error(String(e), { url: req.url, body: req.json() }, e as Error);

    const data = this.resolver.getRunMode() === 'dev'
      ? {
        error: (e as Error)?.message ?? 'not handled error',
        stack: (e as Error)?.stack ?? 'no stack trace',
      }
      : {};
    const err = dodUtility.getAppError<GeneralInternalError>(
      'Internal error',
      'Внутренняя ошибка сервера',
      data,
    );
    return this.getFailure(err, 500);
  }

  protected getFailure(err: GeneralErrorDod, status: number): Response {
    const resultDto: ResultDTO<GeneralErrorDod, never> = {
      httpStatus: status,
      success: false,
      payload: err,
    };
    return responseUtility.createJsonResponse(resultDto, status);
  }

  protected processAfterware(req: Request, resp: Response): Response {
    this.log(req, resp);
    return resp;
  }

  protected log(req: Request, resp: Response): void {
    const method = `${req.method}`.padEnd(8);
    const path = `${new URL(req.url).pathname}`.padEnd(30);
    this.logger.info(`${method}${path}${resp.status}`);
  }
}
