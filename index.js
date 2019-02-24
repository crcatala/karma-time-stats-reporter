const chalk = require("chalk");
const columnify = require("columnify");

const defaultReporterOptions = {
  reportTimeStats: true,
  reportSlowestTests: true,
  binSize: 100,
  slowThreshold: 500,
  reportOnlyBeyondThreshold: false,
  longestTestsCount: 5,
  showSlowTestRankNumber: false
};

function textFormat(val, { type = "info" } = {}) {
  switch (type) {
    case "warn":
      return chalk.yellow(val);
    default:
      return val;
  }
}

function getReporterOptions({
  config,
  reporterOptionsKey = "timeStatsReporter"
} = {}) {
  const reporterOptions = Object.assign(
    defaultReporterOptions,
    config[reporterOptionsKey]
  );

  // normalize slowThreshold
  reporterOptions.slowThreshold =
    Math.ceil(reporterOptions.slowThreshold / reporterOptions.binSize) *
    reporterOptions.binSize;

  return reporterOptions;
}

function percentageBar(
  val,
  {
    totalCharacters = 50,
    boundaryStartCharacter = "[",
    boundaryEndCharacter = "]",
    foregroundCharacter = "\u25AA",
    backgroundCharacter = " "
  } = {}
) {
  const fgCharacterCount = Math.floor((val / 100) * totalCharacters);
  const bgCharacterCount = totalCharacters - fgCharacterCount;

  const fg = foregroundCharacter.repeat(fgCharacterCount);
  const bg = backgroundCharacter.repeat(bgCharacterCount);

  let percentageValueText = `${Math.floor(val)}%`;

  if (percentageValueText.length < 4) {
    percentageValueText =
      " ".repeat(4 - percentageValueText.length) + percentageValueText;
  }

  return `${boundaryStartCharacter}${fg}${bg}${boundaryEndCharacter}${boundaryStartCharacter}${percentageValueText}${boundaryEndCharacter}`;
}

function getTimingStatsForSpecs({ specs = [], binSize, slowThreshold } = {}) {
  const numberOfBins = slowThreshold / binSize;
  let slowTestCount = 0;

  const histogram = {};

  for (let i = 0; i < numberOfBins; i++) {
    histogram[i] = 0;
  }

  for (let i = 0; i < specs.length; i++) {
    const targetBin = Math.floor(specs[i].timeInMilliseconds / binSize);
    if (targetBin >= numberOfBins) {
      slowTestCount++;
    } else {
      histogram[targetBin]++;
    }
  }

  return {
    histogram,
    slowTestCount,
    binSize,
    slowThreshold
  };
}

function printTimingStats({
  histogram,
  totalCount,
  binSize,
  slowTestCount,
  slowThreshold,
  write = console.log
} = {}) {
  const keys = Object.keys(histogram);
  const printableData = [];

  for (let i = 0; i < keys.length; i++) {
    const start = parseInt(keys[i]) * binSize;
    const end = start + binSize;
    const count = histogram[keys[i]];
    const binRange = `${start}-${end}`;
    const unit = "ms";

    printableData.push({
      range: `[${binRange}${unit}]`,
      count,
      percentageBar: percentageBar((count / totalCount) * 100)
    });
  }

  const type = slowTestCount > 0 ? "warn" : "info";

  printableData.push({
    range: textFormat(`[>${slowThreshold}ms]`, { type }),
    count: textFormat(slowTestCount, { type }),
    percentageBar: textFormat(
      percentageBar((slowTestCount / totalCount) * 100),
      { type }
    )
  });

  write(
    columnify(printableData, {
      showHeaders: false,
      config: {
        range: { minWidth: 12 },
        count: { minWidth: 4 }
      }
    })
  );
  write("\n");
}

function getSlowStatsSummary({ specs, slowThreshold } = {}) {
  const totalTime = specs.reduce(
    (acc, spec) => acc + spec.timeInMilliseconds,
    0
  );

  const slowestSpecs = specs.filter(x => x.timeInMilliseconds >= slowThreshold);
  const slowTestTime = slowestSpecs.reduce(
    (acc, spec) => acc + spec.timeInMilliseconds,
    0
  );

  return {
    totalTime,
    slowTestTime,
    slowTestCount: slowestSpecs.length
  };
}

function printSlowTestSummary({
  specs = [],
  write = console.log,
  slowThreshold
} = {}) {
  const { totalTime, slowTestTime, slowTestCount } = getSlowStatsSummary({
    specs,
    slowThreshold
  });

  const percentageSlowTestCount = (
    (slowTestCount / specs.length) *
    100
  ).toFixed(1);
  const percentageSlowTestTime = ((slowTestTime / totalTime) * 100).toFixed(1);

  const type = slowTestCount > 0 ? "warn" : "info";

  write(
    textFormat(
      `\n${percentageSlowTestCount}% of tests were considered slow and accounted for ${percentageSlowTestTime}% of test suite time`,
      { type }
    )
  );
}

function reportSlowestTests({
  specs = [],
  longestTestsCount = 0,
  slowThreshold,
  reportOnlyBeyondThreshold = true,
  showSlowTestRankNumber = false,
  write = console.log
} = {}) {
  let slowestSpecs = specs;
  if (reportOnlyBeyondThreshold) {
    slowestSpecs = specs.filter(x => x.timeInMilliseconds >= slowThreshold);
  }
  slowestSpecs = slowestSpecs
    .sort(function(a, b) {
      return a.timeInMilliseconds < b.timeInMilliseconds ? 1 : -1;
    })
    .slice(0, longestTestsCount);

  const printableData = slowestSpecs.map((spec, index) => {
    const type = spec.timeInMilliseconds >= slowThreshold ? "warn" : "info";
    const testRankNumber = showSlowTestRankNumber ? `${index + 1}) ` : "";

    return {
      time: textFormat(`${testRankNumber}${spec.timeInMilliseconds}ms`, {
        type
      }),
      name: textFormat(spec.name, { type })
    };
  });

  write(columnify(printableData, { showHeaders: false }));
}

const TimeStatsReporter = function(baseReporterDecorator, config) {
  baseReporterDecorator(this);

  const reporterOptions = getReporterOptions({ config });

  let specs = [];

  this.onSpecComplete = function(browser, result) {
    const name = result.suite.join(" ") + " " + result.description;

    specs.push({
      browser: browser.name,
      name: name,
      timeInMilliseconds: result.time,
      slowThreshold: reporterOptions.slowThreshold
    });
  };

  this.onRunComplete = (browsers, _results) => {
    browsers.forEach(browser => {
      const browserName = browser.name;
      let browserNameHeaderSuffix = "";
      if (browsers.length > 1) {
        browserNameHeaderSuffix = ` - ${browserName}`;
      }

      const specsForBrowser = specs.filter(x => x.browser === browserName);

      if (reporterOptions.reportTimeStats) {
        const header = chalk.bold(
          `\nTest Time Stats${browserNameHeaderSuffix}\n`
        );

        this.write(header);
        this.write("Percentages reported are based on number of tests\n");

        const {
          histogram,
          binSize,
          slowTestCount,
          slowThreshold
        } = getTimingStatsForSpecs({
          specs: specsForBrowser,
          binSize: reporterOptions.binSize,
          slowThreshold: reporterOptions.slowThreshold
        });
        printTimingStats({
          histogram,
          totalCount: specsForBrowser.length,
          binSize,
          slowTestCount,
          slowThreshold,
          write: this.write.bind(this)
        });

        if (slowTestCount > 0) {
          printSlowTestSummary({ specs: specsForBrowser, slowThreshold });
        }
      }

      if (reporterOptions.reportSlowestTests) {
        const header = chalk.bold(
          `\nSlowest Tests${browserNameHeaderSuffix}\n`
        );
        this.write(header);
        reportSlowestTests({
          singleBrowser: browsers.length === 1,
          reportOnlyBeyondThreshold: reporterOptions.reportOnlyBeyondThreshold,
          specs: specsForBrowser,
          slowThreshold: reporterOptions.slowThreshold,
          longestTestsCount: reporterOptions.longestTestsCount,
          showSlowTestRankNumber: reporterOptions.showSlowTestRankNumber,
          write: this.write.bind(this)
        });
      }

      this.write("\n\n");
    });

    specs = [];
  };
};

TimeStatsReporter.$inject = ["baseReporterDecorator", "config"];

module.exports = {
  "reporter:time-stats": ["type", TimeStatsReporter],
  getTimingStatsForSpecs,
  printTimingStats,
  getReporterOptions,
  getSlowStatsSummary
};
