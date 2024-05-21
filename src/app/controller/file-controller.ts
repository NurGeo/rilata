import { join } from 'node:path';
import { responseUtility } from '../../common/utils/responce/response-utility';
import { GeneralServerResolver, GeneralModuleResolver } from '../base.index';
import { Controller } from './controller';
import { ResponseFileOptions } from './types';

export abstract class FileController<
  R extends GeneralServerResolver | GeneralModuleResolver
> extends Controller<R> {
  protected abstract filePath: string;

  protected abstract fileOptions: ResponseFileOptions;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(req: Request): Promise<Response> {
    const path = join(this.resolver.getProjectPath(), this.filePath);
    return responseUtility.createFileResponse(path, this.fileOptions);
  }
}
