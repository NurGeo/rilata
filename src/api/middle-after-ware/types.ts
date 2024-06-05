import { GeneralModuleResolver } from '../module/types.js';
import { GeneralServerResolver } from '../server/types.js';
import { Afterware } from './afterware.js';
import { Middleware } from './middleware.js';

export type GeneralMiddleware = Middleware<GeneralServerResolver | GeneralModuleResolver>;

export type GeneralAfterware = Afterware<GeneralServerResolver | GeneralModuleResolver>;
