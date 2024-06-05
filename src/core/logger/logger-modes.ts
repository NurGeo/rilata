/* eslint-disable consistent-return */
// ++++++++++++ types +++++++++++++++++
import { BinaryKeyFlag } from '#core/utils/binary/binary-flag/binary-flag.js';

/* eslint-disable key-spacing */
export const loggerModes = {
  info:  0b000001, // 1
  warn:  0b000010, // 2
  error: 0b000100, // 4
  fatal: 0b001000, // 8
};

export type LoggerModes = keyof typeof loggerModes;

export type InputLoggerModes = LoggerModes[] | 'all' | 'off';

// ++++++++++++ const and functions +++++++++++++++++

let cachedLogMode: InputLoggerModes | undefined;

export function getEnvLogMode(): InputLoggerModes | undefined {
  if (cachedLogMode) return cachedLogMode;

  // в env можно передавать одну из значений 'info', 'warn', 'error', 'fatal', 'all', 'off'
  // или битовое число, например 5 означает сумму 1+4 = ['info', 'error']
  // число 0 эквивалентно 'off'.
  // любое другое значение эквивалентно 'all'
  const envLogMode = process.env.LOG_MODE;
  if (envLogMode === undefined) return;

  const flags = Number(envLogMode);
  if (isNaN(flags)) {
    if (envLogMode === 'all' || envLogMode === 'off') {
      cachedLogMode = envLogMode;
    } else if (Object.keys(loggerModes).includes(envLogMode)) {
      cachedLogMode = [envLogMode] as LoggerModes[];
    }
  } else if (flags >= 0) {
    if (flags <= 0) {
      cachedLogMode = 'off';
    } else {
      const modes = BinaryKeyFlag.getFlagKeys(loggerModes, flags);
      if (modes.length !== 0) cachedLogMode = modes;
    }
  }
  // eslint-disable-next-line no-console
  if (cachedLogMode) console.log('log mode setted: ', cachedLogMode);
  return cachedLogMode;
}
