import { promisify } from 'node:util';
import { describe, before, it } from 'node:test';
import assert from 'node:assert';

import { exec } from 'node:child_process';

describe("e2e", () => {
  describe("run on self as a fixture with default reporter", () => {
    const ctx = setupCase({
      cmd: 'node bin/cli.mjs',
    });

    it('should not fail', () => assert.ifError(ctx.err));
    it('should not print anything to stderr', () => assert('' == ctx.stderr, ctx.stderr));
    
    it('should emit the stats summary', () => assert(ctx.stdout.includes('Summary:')));
    it('should emit the stats', () => assert(ctx.stdout.includes('Stats:')));
  });

  describe("run on self as a fixture with inspect reporter", () => {
    const ctx = setupCase({
      cmd: 'node bin/cli.mjs',
      env: { REPORT: 'inspect' },
    });

    it('should not fail', () => assert.ifError(ctx.err));
    it('should not print anything to stderr', () => assert('' == ctx.stderr, ctx.stderr));
  });

  describe("run on self as a fixture with unsupported reporter", () => {
    const ctx = setupCase({
      cmd: 'node bin/cli.mjs',
      env: { REPORT: 'no-such-reporter' },
    });

    it('should not fail', () => assert.ifError(ctx.err));
    it('should warn about unsupported error and defaulting to `summary`', () => assert(ctx.stderr.includes('no-such-reporter'), ctx.stderr));
  });

  describe("run a directory without `node_modules`", () => {
    const aDirWithoutNodeModules = 'bin';
    const ctx = setupCase({
      cmd: `node bin/cli.mjs ${aDirWithoutNodeModules}`,
    });

    it('should end with error', () => assert(ctx.err));
    it('should state that the directory has no packages', () => assert(String(ctx.err.stdout).startsWith('ERR_NO_PACAKGES:')));
  });
});

function setupCase({cmd, env = {}}) {
  const ctx = {};
  before(() => promisify(exec)(cmd, { env: { ...process.env, ...env }})
    .then(({stderr, stdout}) => {
      ctx.stderr = stderr;
      ctx.stdout = stdout;
    })
    .catch(err => ctx.err = err)
  );

  return ctx;
}