# What's in my deps? statistics for your installed modules.

This is a simple CLI tool that takes a whiff of your `node_modules` and spits out some statistics about them.

[![Coverage Status](https://coveralls.io/repos/github/osher/whats-in-my-deps/badge.svg?branch=main)](https://coveralls.io/github/osher/whats-in-my-deps?branch=main)

# usage: 
```sh
npx whats-in-my-deps
```

Expect output that ends like so:
```

 Summary:
   total:      41
   redundant:  9        (just the extra dups)
   fake:       0        (tests, example or boilerplate)
   Errored:    0

 Stats:
   CJS:        24
   ESM:        15
   DUAL:       2
   TYPES:      0
   misc.:      0        (i.e .node, .json)

```

By default, it looks for `node_modules` in your current work directory.
However, you can  pass it a path as an argument.

```sh
npx stat-my-deps ~/workspace/my-project
```

# What are these statistics?

## Summary
* `total` - the number of package.json files the glob found in the `node_modules` directory.
* `redundant` - the number of *duplications* - the count of redundant coppies of existing packages. 
  e.g. if a a package was found 4 times - then 3 of them are duplications. This treats different versions of the same package also as duplicates.
* `fake` - package.json that were found in the `node_modules` directory, but do not represent a real package. Either because they were transpiled to `dist`, or they are a part of a boilerplate the package uses, or a part of its tests. (this stat is pending deprecation ever since the glob that finds `package.json` files was refined).
* `Errored` - packages that the code failed to analyse and identify what they are.

## Stats
* `CJS` - the shipped code in the package was identified as commonJS. (it could be transpiled from ESM, but the actual distribution is CJS).
* `ESM` - the shipped code in the package was identified as ES-Modules.
* `Dual` - the package includes an `exports` clause. (this is a naive assumption that may be refined in a PR)
* `Types` - the package is identified as a types package.
* `misc.` - the package does not ship JS code, but `.node`, `.json`, local-arch binaries or other miscellaneous files.

# Contribute a data point

This package was published as a part of a research about ESM adoption.

If you would like to contribute a data-point to the research - you can submit your summary and stats in [this google-form](https://docs.google.com/forms/d/1ibF50XeZbcNMA2eRWdl1RdfRUGa7LcDivdOI1oG5Uv4).

# Contribute to the project

Gladly. The project uses test and coverage tools built in nodejs, and as such, it is developed with rather recent node versions (>=20).
(However, it should run on all node versions of LTS or later).

If you found a bug, would like to make an improvement, or have any ideas - go ahead!

# Lisence

ISC.
