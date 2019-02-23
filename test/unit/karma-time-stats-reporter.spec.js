const TimeStatsReporter = require("../../index");

const specs = [
  { timeInMilliseconds: 0 },
  { timeInMilliseconds: 100 },
  { timeInMilliseconds: 101 },
  { timeInMilliseconds: 200 },
  { timeInMilliseconds: 201 },
  { timeInMilliseconds: 202 },
  { timeInMilliseconds: 300 },
  { timeInMilliseconds: 301 },
  { timeInMilliseconds: 302 },
  { timeInMilliseconds: 303 },
  { timeInMilliseconds: 400 },
  { timeInMilliseconds: 401 },
  { timeInMilliseconds: 402 },
  { timeInMilliseconds: 403 },
  { timeInMilliseconds: 404 },
  { timeInMilliseconds: 500 },
  { timeInMilliseconds: 1000 }
];

describe("karma-time-stats-reporter", () => {
  describe("#getReporterOptions", () => {
    it("normalizes the slowTheshold option to a value evenly divisible by binSize", () => {
      const scenarios = [
        {
          config: {
            timeStatsReporter: {
              binSize: 100,
              slowThreshold: 50
            }
          },
          expectedSlowThreshold: 100
        },
        {
          config: {
            timeStatsReporter: {
              binSize: 100,
              slowThreshold: 100
            }
          },
          expectedSlowThreshold: 100
        },
        {
          config: {
            timeStatsReporter: {
              binSize: 100,
              slowThreshold: 500
            }
          },
          expectedSlowThreshold: 500
        },
        {
          config: {
            timeStatsReporter: {
              binSize: 100,
              slowThreshold: 501
            }
          },
          expectedSlowThreshold: 600
        }
      ];

      scenarios.forEach((scenario, index) => {
        const result = TimeStatsReporter.getReporterOptions({
          config: scenario.config
        });

        expect(result.slowThreshold).to.eq(
          scenario.expectedSlowThreshold,
          `binSize: ${
            scenario.config.timeStatsReporter.binSize
          }, slowThreshold: ${scenario.config.timeStatsReporter.slowThreshold}`
        );
      });
    });
  });

  describe("#getTimingStatsForSpecs", () => {
    it("returns histogram and number of slow tests", () => {
      const result = TimeStatsReporter.getTimingStatsForSpecs({
        specs,
        binSize: 100,
        slowThreshold: 500
      });

      expect(result).to.deep.eq({
        histogram: {
          0: 1,
          1: 2,
          2: 3,
          3: 4,
          4: 5
        },
        slowTestCount: 2,
        binSize: 100,
        slowThreshold: 500
      });
    });
  });

  describe("#printTimingStats", () => {
    beforeEach(() => {
      sinon.stub(console, "log");
    });

    it("logs histogram counts", () => {
      TimeStatsReporter.printTimingStats({
        histogram: {
          0: 1,
          1: 2,
          2: 3,
          3: 4,
          4: 5
        },
        binSize: 100,
        slowTestCount: 7,
        slowThreshold: 500
      });

      expect(console.log.getCall(0).args[0]).to.match(/\[0-100ms\]\s+1/);
      expect(console.log.getCall(0).args[0]).to.match(/\[100-200ms\]\s+2/);
      expect(console.log.getCall(0).args[0]).to.match(/\[200-300ms\]\s+3/);
      expect(console.log.getCall(0).args[0]).to.match(/\[300-400ms\]\s+4/);
      expect(console.log.getCall(0).args[0]).to.match(/\[400-500ms\]\s+5/);
    });
  });

  describe("#getSlowStatsSummary", () => {
    it("returns", () => {
      const result = TimeStatsReporter.getSlowStatsSummary({
        specs,
        slowThreshold: 500
      });

      expect(result).to.deep.eq({
        slowTestCount: 2,
        totalTime: 5520,
        slowTestTime: 1500
      });
    });
  });
});
