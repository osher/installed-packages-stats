//import analyse from '../lib/analyse.cjs';
import analyse from '../lib/analyse.mjs';
import summaryReport from '../lib/summary-report.mjs';
import inspectReport from '../lib/inspect-report.mjs';

const options = {
    root: `${process.argv[2] || process.cwd()}`
};

const stats = await analyse(options);

console.log(process.env.REPORT == 'inspect' ? inspectReport(stats) : summaryReport(stats));