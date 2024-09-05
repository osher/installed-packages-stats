# Statistics for my Dependencies (`stat-my-deps`)

This is a simple CLI tool that takes a whiff of your `node_modules` and spits out some statistics about them.

# usage: 
```sh
npx stat-my-deps
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
