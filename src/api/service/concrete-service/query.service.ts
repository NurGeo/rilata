import { GeneralModuleResolver } from '../../module/types.js';
import { BaseService } from '../base.service.js';
import { GeneralQueryServiceParams, ServiceResult } from '../types.js';

export abstract class QueryService<
  P extends GeneralQueryServiceParams, RES extends GeneralModuleResolver
> extends BaseService<P, RES> {
  protected async executeService(input: P['input']): Promise<ServiceResult<P>> {
    return this.runDomain(input);
  }
}
