describe("Single Slow Example", () => {
  it("is slow", done => {
    setTimeout(() => {
      expect(true).to.eq(true);
      done();
    }, 1000);
  });
});
