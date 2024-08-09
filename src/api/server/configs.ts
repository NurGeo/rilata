import { getEnvLogMode } from '#core/logger/logger-modes.js';
import { JwtConfig, RunMode, ServerConfig } from './types.js';

export const defaultServerConfig: Required<ServerConfig> = {
  localHost: 'localhost',
  localPort: 3000,
  loggerModes: 'all',
};

export const defaultJwtConfig: JwtConfig = {
  algorithm: 'HS256',
  jwtLifetimeAsHour: 24,
  jwtRefreshLifetimeAsHour: 24 * 3,
};

export const defaultPublicPort = 80;

function throwErr(errStr: string): never {
  throw Error(errStr);
}

export function getJwtSecretKey(key?: string): string {
  return process.env.JWT_SECRET ?? key ?? throwErr('not found jwt secret key in env.JWT_SECRET');
}

export function getPublicHost(host?: string): string {
  return process.env.PUBLIC_HOST ?? host ?? throwErr('not found public host name in env.PUBPLIC_HOST');
}

export function getPublicPort(port?: number): number {
  const publicPort = Number(process.env.PUBLIC_PORT);
  return isNaN(publicPort) ? (port ?? 80) : publicPort;
}

export function getJwtConfig(config?: Partial<JwtConfig>): JwtConfig {
  const inputConfig = config ?? {};
  return {
    ...defaultJwtConfig,
    ...inputConfig,
  };
}

export function getBotLoggerToken(token?: string): string {
  return process.env.BOT_LOGGER_TOKEN ?? token ?? throwErr('not found bot logger token in env.BOT_LOGGER_TOKEN');
}

export function getBotLoggerManagerIds(ids?: string[]): string[] {
  return process.env.BOT_LOGGER_MANAGER_IDS?.split(',') ?? ids ?? throwErr('not found bot logger manager ids in env.BOT_LOGGER_MANAGER_IDS');
}

export function getServerConfig(config?: Partial<ServerConfig>): ServerConfig {
  let envPort: number | undefined = Number(process.env.LOCAL_PORT);
  envPort = isNaN(envPort) ? undefined : envPort;
  return {
    localPort: envPort ?? config?.localPort ?? defaultServerConfig.localPort,
    localHost: process.env.LOCAL_HOST ?? config?.localHost ?? defaultServerConfig.localHost,
    loggerModes: getEnvLogMode() ?? config?.loggerModes ?? defaultServerConfig.loggerModes,
  };
}

function getEnvRunMode(): RunMode | undefined {
  const mode = process.env.NODE_ENV;
  if (mode === 'prod' || mode === 'production') return 'prod';
  if (mode === 'dev' || mode === 'development') return 'dev';
  if (mode === 'test') return 'test';
  return undefined;

  // const allModes: UnionToTuple<RunMode> = ['test', 'dev', 'prod'];
  // // eslint-disable-next-line consistent-return
  // return allModes.find((arrMode) => arrMode === mode);
}

export function getRunMode(defMode?: RunMode): RunMode {
  return getEnvRunMode() ?? defMode ?? 'test';
}
