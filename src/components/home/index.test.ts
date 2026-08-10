describe("test block", () => {
  it("adds 1 + 2 to equal 3", () => {
    expect(sum(1, 2)).toBe(3);
  });
});

export const sum = (a: number, b: number) => {
  return a + b;
};
