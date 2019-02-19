# karma-time-stats-reporter

## Use In Project

Install package:

`npm install karma-time-stats-reporter --save-dev`

in your karma config:

```js
module.exports = function(config) {
  // other keys ommited for brevity
  config.set({
    reporters: ["dots", "time-stats"],
    // This is config options for the reporter. Listed here are the defaults if you don't provide this any options
    timeStatsReporter: {
      reportTimeStats: true,           // Print Time Stats (histogram)
      binSize: 100,                    // Bin size for histogram (in milliseconds)
      slowThreshold: 500,              // The threshold for what is considered a slow test (in milliseconds).
                                       // This is also the max value for last bin histogram 
      reportSlowestTests: true,        // Print top slowest tests
      longestTestsCount: 5,            // Number of top slowest tests to list
      reportOnlyBeyondThreshold: false // Only report tests that are slower than threshold
    }
  });
};
```
