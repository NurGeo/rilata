/* eslint-disable no-use-before-define */
/* eslint-disable no-bitwise */
/* eslint-disable consistent-return */
// ++++++++++++ types +++++++++++++++++
import { BinaryKeyFlag } from '#core/utils/binary/binary-flag/binary-flag.js';

/* eslint-disable key-spacing */
export const loggerModes = {
  info:  1 << 0, // 1
  warn:  1 << 1, // 2
  error: 1 << 2, // 4
  fatal: 1 << 3, // 8
  // 1 << 4  - reserved 1,
  // 1 << 5  - reserved 2,
};

type LoggerModeKeys = keyof typeof loggerModes;

export type LoggerModes = LoggerModeKeys[] | 'all' | 'off';

// ++++++++++++ const and functions +++++++++++++++++

let cachedLogMode: LoggerModes | undefined;

export function getEnvLogMode(): LoggerModes | undefined {
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
      cachedLogMode = [envLogMode] as LoggerModeKeys[];
    }
  } else if (flags >= 0) {
    if (flags <= 0) {
      cachedLogMode = 'off';
    } else {
      const modes = BinaryKeyFlag.getFlagKeys(loggerModes, flags);
      if (modes.length !== 0) cachedLogMode = modes;
    }
  }
  return cachedLogMode;
}
