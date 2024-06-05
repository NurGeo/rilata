import { Bus } from '../bus/bus.js';

export interface BusServerResolver{
  getBus(): Bus
}
