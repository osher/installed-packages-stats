import importedParams from '../lib/params.mjs';
import importedAnalyse from '../lib/analyse.mjs';
import summary from '../lib/summary-report.mjs';
import inspect from '../lib/inspect-report.mjs';

const reporterStrategy = { summary, inspect }

export {
  importedAnalyse as analyse,
  importedParams as params,
  reporterStrategy as reporters,
};

export default async ({
  /* inversion of control: */
  process = global.process,
  logger = global.console,
  analyse = importedAnalyse,
  params = importedParams,
  reporters = reporterStrategy,
} = {}) => {
  const options = params({process});
  options.logger = logger;

  try {
    const stats = await analyse(options);

    let reporter = reporters[options.reporter];
    if (!reporter) {
      logger.warn('unsupported reporter: %s. defaulting to summary', options.reporter);
      reporter = reporters.summary;
    }

    logger.log(reporter(stats));
  } catch(e) {
    const info = { ...e };
    delete info.code;
    logger.log(e.message);
    if (Object.keys(info).length) logger.log(info);
    process.exitCode = 1;
  }
}
