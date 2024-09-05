let prop;
export default ({globResults, fake, cjs, esm, dual, types, binding, json, duplicates, unidentified }) => `
----------------------------------------------------------
 Errored:
${unidentified.map(p => `   ${p.name} ${p.error.message}`).join('\n') || '   none'}

 Duplicates:
${Object.keys(duplicates).sort().map(d => `   ${d}: ${duplicates[d].length} times`).join('\n') || '   none' }

 Summary:
   total:      ${globResults.length}
   redundant:  ${ Object.values(duplicates).reduce((acc, dups) => acc + dups.length, -Object.keys(duplicates).length) }\t(just the extra dups)
   fake:       ${fake.length}\t(fixture, examples or boilerplate)
   Errored:    ${unidentified.length}

 Stats:
   CJS:        ${cjs.length}
   ESM:        ${esm.length}
   DUAL:       ${dual.length}
   TYPES:      ${types.length}
   misc.:      ${binding.length + json.length}\t(i.e .node, .json)
`;
