const TimeStatsReporter = require("../../../index");

function getFiles() {
  if (process.env.SPECS) {
    return process.env.SPECS.split(",");
  } else if (process.env.SPEC) {
    return [process.env.SPEC];
  } else {
    return ["**/*.spec.js"];
  }
}

const timeStatsReporter = {};

if (process.env.TIME_STATS_REPORTER_LONGEST_TESTS_COUNT) {
  timeStatsReporter.longestTestsCount =
    process.env.TIME_STATS_REPORTER_LONGEST_TESTS_COUNT;
}

if (process.env.TIME_STATS_REPORTER_SLOW_THRESHOLD) {
  timeStatsReporter.slowThreshold =
    process.env.TIME_STATS_REPORTER_SLOW_THRESHOLD;
}

if (process.env.TIME_STATS_REPORTER_REPORT_TIME_STATS) {
  timeStatsReporter.reportTimeStats =
    process.env.TIME_STATS_REPORTER_REPORT_TIME_STATS !== "false";
}

if (process.env.TIME_STATS_REPORTER_REPORT_SLOWEST_TESTS) {
  timeStatsReporter.reportSlowestTests =
    process.env.TIME_STATS_REPORTER_REPORT_SLOWEST_TESTS !== "false";
}

module.exports = function(config) {
  config.set({
    frameworks: ["mocha", "chai"],
    plugins: ["karma-*", TimeStatsReporter],
    files: getFiles(),
    reporters: ["spec", "time-stats"],
    autoWatch: false,
    browsers: ["ChromeHeadless"],
    singleRun: true,
    timeStatsReporter
  });
};
