import fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { globSync } from 'glob';
import { count } from 'node:console';

export default async ({ root }) => {
  const xStripQuotes = /[\"\']/g;
  const xArchBin = /((linux|netbsd|dawrin|win32|android|freebsd)-(arm|arm64|s390x|mips64el|ppc64|loong64|x64|riscv64|ia32)|\/wasi-preview1)$/;
  const xESM = /export |import /;
  const xCJS = /^\(function \(global|require|module\.exports|exports[\.\[]|= *exports;|Object.defineProperty\(exports,|Object.defineProperty\(module, *['"]exports['"],|['"]object['"] === typeof exports/;
  const acceptableIndexes = ["index.js", "index.cjs", "index.json", "index.mjs"];

  const stats = {
    all: null,
    cjs: [],
    esm: [],
    dual: [],
    types: [],
    binding: [],
    json: [],
    unidentified: [],
  }

  stats.globResults = globSync([
    'node_modules/*/package.json',
    'node_modules/*/*/package.json',
    'node_modules/**/node_modules/*/package.json',
    'node_modules/**/node_modules/*/*/package.json',
  ], {
    cwd: root,
    nodir: true,
  })
  
  const packages = stats.globResults.map(packageJsonPath => ({ packageJsonPath }));
  packages.byName = {};

  stats.all = packages.concat();

  let pervPackage = null;
  await Promise.all(packages.map(analysePackage));

  return stats;

  async function analysePackage(pkg) {
    const { packageJsonPath } = pkg;
    const nameFromPath = packageJsonPath.replace(/.*node_modules\//,'').replace('/package.json', '');
    pkg.name = nameFromPath;

    if (nameFromPath in packages.byName) {
      pkg = packages.byName[nameFromPath];
      pkg.occurencies++;
      pkg.packageJsonPaths.push(packageJsonPath);
      return;
    }

    if (pervPackage) {
      const dirPath = pervPackage.packageJsonPath.replace(/\/package.json$/, '');
      if (packageJsonPath.startsWith(dirPath) && !packageJsonPath.slice(0, dirPath.length - 1).includes('/node_modules/')) {
        //its some example package.json of /tests or /examples that is shipped with the package
        return;
      }
    }

    pervPackage = pkg;

    pkg.occurencies = 1;
    pkg.packageJsonPaths = [packageJsonPath];
    packages.byName[nameFromPath] = pkg;

    const countAs = (type) => {
      pkg[type] = type;
      stats[type].push(pkg);
    };

    try {
      console.log("checking: %s", packageJsonPath);

      const { name, type, types, main, exports } = JSON.parse(await fs.readFile(join(root, packageJsonPath)));
      pkg.info = { name, type, types, main, exports };

      if ( packageJsonPath.includes('-types/')
        || packageJsonPath.includes('/types/package.json')
        || packageJsonPath.includes('/@types/')
        || packageJsonPath.includes('/type-fest/')
      ) {
        countAs('types');
        return;
      }

      if (type === 'commonjs') {
        countAs('cjs');
        return;
      }

      if (type === 'module') {
        countAs('esm');
        return;
      }

      if (exports) {
        //TBD - naive asumption, but ok for now...
        countAs('dual');
        return;
      }

      if (nameFromPath.startsWith("@tsconfig/")) {
        countAs('types'); //or should it be json?
        return;
      }

      if (nameFromPath.match(xArchBin)) {
        countAs('binding');
        return;
      }

      if (main?.endsWith('.node')) {
        countAs('binding');
        return;
      }

      if (main === "") {
        try {
          await fs.stat(join(root, dirname(packageJsonPath), 'index.js.flow'));
          countAs('types');
          return;
        } catch (e){
          console.log(e)
          process.exit()
        }
      }

      if (!main && types) {
        countAs('types');
        return;
      }

      const mainFileText = (await readMainEntrypoint(dirname(packageJsonPath), main)).toString().trim();

      if (mainFileText === "json") {
        countAs('json');
        return;
      }

      if (mainFileText.replaceAll(xStripQuotes, "") == 'use strict') {
        //TBD - a naive asumption, but ok for now...
        countAs('types');
        return;
      }

      if (mainFileText.match(xESM)) {
        countAs('esm');
        return;
      }

      if (mainFileText.match(xCJS)) {
        countAs('cjs');
        return;
      }

      countAs('unidentified');
    } catch (e) {
      pkg.error = e;
      console.log(e)
      countAs('unidentified');
    }
  }

  async function readMainEntrypoint(pkgBase, main) {
    if (!main) {
      try {
        return await fs.readFile(join(root, pkgBase, 'index.js'));
      } catch {
        try {
          await fs.readFile(join(root, pkgBase, 'index.json'));
          return "json";
        } catch {
          throw newErr('main is not specified, and ./index.js is not found', { code: 'ERR_INDEX_MISSING', root, pkgBase });
        }
      }
    }

    const mainPath = join(root, pkgBase, main);

    //explicit ending = it's a file
    if (main.endsWith('.js') || main.endsWith('.cjs') || main.endsWith('.mjs')) {
      return fs.readFile(mainPath);
    }


    if (main.endsWith(".json")) {
      try {
        await fs.readFile(mainPath);
        return "json";
      } catch {}
    }

    //a dir or a postfixless file expected to resolve automatically?
    //trying file postfixes
    try { 
      return await fs.readFile(mainPath + ".js");
    } catch (e) {}

    try {
      return await fs.readFile(mainPath + ".cjs");
    } catch {}

    try {
      return await fs.readFile(mainPath + ".json");
    } catch {}

    try { //im not sure this case is legal, but seen wierd things...
      return await fs.readFile(mainPath + ".mjs");
    } catch {}

    //it's a directory
    const files = await fs.readdir(mainPath);
    const indexes = acceptableIndexes.filter(ix => files.includes(ix));

    for (let i = 0; i < indexes.length; i++) {
      return await fs.readFile(join(mainPath, indexes[0]));
    }

    throw newErr('Could not resolve pacakge main entrypoint', { pkgBase, main, code: 'ERR_MAIN_UNRESOLVED' });
  }
}

function newErr(message, rest) {
  return Object.assign(new Error(`${rest.code}: ${message}`), rest);
}