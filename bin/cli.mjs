import params from '../lib/params.mjs';
import analyse from '../lib/analyse.mjs';
import summaryReport from '../lib/summary-report.mjs';
import inspectReport from '../lib/inspect-report.mjs';

const options = params({process});

const stats = await analyse(options);

console.log(process.env.REPORT == 'inspect' ? inspectReport(stats) : summaryReport(stats));