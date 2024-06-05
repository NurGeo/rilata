import { BusBunServer } from '../../../src/api/server/bus-server.js';
import { serverStarter } from './starter.js';

const server = serverStarter.start('all') as BusBunServer;
server.run();
