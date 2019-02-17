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
  { timeInMilliseconds: 500 }
];

describe("karma-time-stats-reporter", () => {
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
        slowTestCount: 1,
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
});
