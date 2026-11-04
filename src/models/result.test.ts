import { Result } from "./result.js";

describe("Result tests", () => {
  it("returns an err using Result.err", () => {
    const err = new Error("A bad error");

    const result = Result.failure(err);

    expect(result).toBeFailure(err);
  });

  it("returns an ok using Result.ok", () => {
    const value = "Success";

    const result = Result.success(value);

    expect(result).toBeSuccess(value);
  });

  it("returns an ok when a synchronous method returns without throwing", () => {
    const func = () => "Success";

    const result = Result.try(func);

    expect(result).toBeSuccess("Success");
  });

  it("returns an err when a synchronous method throws", () => {
    const err = new Error("Failure");
    const func = () => {
      throw err;
    };

    const result = Result.try(func);

    expect(result).toBeFailure(err);
  });

  it("returns an ok when a asynchronous method returns without throwing", async () => {
    const func = async () => "Success";

    const result = await Result.tryAsync(func);

    expect(result).toBeSuccess("Success");
  });

  it("returns an err when a asynchronous method returns throws", async () => {
    const err = new Error("Failure");
    const func = async () => {
      throw err;
    };

    const result = await Result.tryAsync(func);

    expect(result).toBeFailure(err);
  });
});
