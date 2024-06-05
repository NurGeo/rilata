import { BunServer } from '../../../src/api/server/bun-server.js';
import { RilataServer } from '../../../src/api/server/server.js';
import { serverStarter } from './starter.js';
import { ServiceModulesFixtures } from './server-fixtures.js';
import { TestDatabase } from '../../../src/api/database/test.database.js';
import { GeneralServerResolver } from '../../../src/api/server/types.js';

function parseArgs(
  server: RilataServer, resolver: GeneralServerResolver,
): void {
  const [pathToBun, pathToTs, ...others] = Bun.argv;
  if (others.includes('-f') || others.includes('--fixtures')) {
    const modules = server.getModules();
    resolver.getLogger().info(
      `init test database fixtures for modules: ${modules.map((m) => m.moduleName).join('; ')}`,
    );
    modules.filter((m) => m.moduleName !== 'FrontProxyModule').forEach((module) => {
      const db = module.getModuleResolver().getDatabase() as unknown as TestDatabase<true>;
      db.addBatch(ServiceModulesFixtures.repoFixtures);
    });
    resolver.getLogger().info('init test database fixtures finished');
  }
}

export function main(): void {
  const server = serverStarter.start('all') as BunServer;
  parseArgs(server, server.getServerResolver());
  server.run();
}

main();
