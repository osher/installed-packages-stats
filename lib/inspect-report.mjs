import { inspect } from 'node:util';

export default (stats) => inspect(stats, { colors: process.stdout.isTTY, depth: 10, maxArrayLength: 5000 });