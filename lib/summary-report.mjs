export default ({cjs, esm, dual, types, binding, json, unidentified }) => `
 Unknown:
${unidentified.length ? unidentified.map(p => ` - ${p.name} ${p.error?.message ?? '' }`).join('\n') : '   types of all packages were detected'}

 Summary:
   CJS:    ${cjs.length}
   ESM:    ${esm.length}
   DUAL:   ${dual.length}
   TYPES:  ${types.length}
   misc.:  ${binding.length + json.length}\t(i.e .node, .json)
   Unkown: ${unidentified.length}
`;