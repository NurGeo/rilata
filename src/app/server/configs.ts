import { getEnvLogMode, UnionToTuple } from '../../common/index';
import { JwtConfig, RunMode, ServerConfig } from './types';

export const defaultServerConfig: Required<ServerConfig> = {
  hostname: 'localhost',
  port: 3000,
  loggerModes: 'all',
};

export const defaultJwtConfig: JwtConfig = {
  algorithm: 'HS256',
  jwtLifetimeAsHour: 24,
  jwtRefreshLifetimeAsHour: 24 * 3,
};

export function getJwtConfig(config?: Partial<JwtConfig>): JwtConfig {
  const inputConfig = config ?? {};
  return {
    ...defaultJwtConfig,
    ...inputConfig,
  };
}

export function getServerConfig(config?: ServerConfig): Required<ServerConfig> {
  const port = isNaN(Number(process.env.PORT)) ? undefined : Number(process.env.PORT);
  return {
    port: port ?? config?.port ?? defaultServerConfig.port,
    hostname: process.env.HOST ?? config?.hostname ?? defaultServerConfig.hostname,
    loggerModes: getEnvLogMode() ?? config?.loggerModes ?? defaultServerConfig.loggerModes,
  };
}

function getEnvRunMode(): RunMode | undefined {
  const mode = process.env.NODE_ENV;
  if (mode === undefined) return;

  const allModes: UnionToTuple<RunMode> = ['test', 'dev', 'prod'];
  // eslint-disable-next-line consistent-return
  return allModes.find((arrMode) => arrMode === mode);
}

export function getRunMode(defMode?: RunMode): RunMode {
  return getEnvRunMode() ?? defMode ?? 'test';
}
