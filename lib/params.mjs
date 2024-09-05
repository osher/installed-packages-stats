export default ({process}) => {
  return {
    root: process.argv[2] || process.cwd(),
    reporter: process.env.REPORT || 'summary',
  };
}