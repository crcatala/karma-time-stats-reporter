describe("Three Slow Examples", () => {
  it("is slow", done => {
    setTimeout(() => {
      expect(true).to.eq(true);
      done();
    }, 100);
  });

  it("is slow", done => {
    setTimeout(() => {
      expect(true).to.eq(true);
      done();
    }, 1000);
  });

  it("is slow", done => {
    setTimeout(() => {
      expect(true).to.eq(true);
      done();
    }, 1000);
  });
});
