import { Database } from '../database/database.js';
import { Module } from './module.js';

export type ModuleResolves<M extends Module> = {
  moduleName: M['moduleName'],
  moduleUrls: string[] | RegExp[], // example: ['/api/company-module/']
  db: Database,
}
