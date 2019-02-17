module.exports = function(config) {
  config.set({
    frameworks: ["browserify", "mocha", "sinon-chai"],
    files: ["**/*.spec.js"],
    reporters: ["mocha"],
    mochaReporter: {
      showDiff: true
    },
    preprocessors: {
      "**/*.js": ["browserify"]
    },
    browserify: {
      debug: true
    },
    browsers: ["ChromeHeadless"]
  });
};
