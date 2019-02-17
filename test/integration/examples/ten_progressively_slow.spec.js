describe("Example", () => {
  Array(10)
    .fill()
    .forEach((_x, i) => {
      it(`ExampleSlowTest #${i + 1}`, done => {
        setTimeout(() => {
          expect(true).to.eq(true);
          done();
        }, 10 + (i + 1) * 10);
      });
    });
});
