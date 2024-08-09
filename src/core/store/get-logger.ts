import { domainStore } from './domain-store.js';
import { Logger } from '../logger/logger.ts';
import { ConsoleLogger } from '../logger/console-logger.ts';

export function getLogger(): Logger {
  let logger = domainStore?.getPayload()?.logger;
  if (!logger) {
    logger = new ConsoleLogger('all');
    logger.error('Unauthorized receipt of a logger before its installation in the domain store');
  }
  return logger;
}
