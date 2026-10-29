export type Success<T> = { success: true; value: T };
export type Failure<E> = { success: false; error: E };

export type Result<T, E = Error> = Success<T> | Failure<E>;

export const Result = {
  try<T>(fn: () => T): Result<T, Error> {
    try {
      return { success: true, value: fn() };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e : new Error("Unknown error thrown: " + e),
      };
    }
  },

  async tryAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
      const value = await fn();
      return Result.success(value);
    } catch (e) {
      return Result.failure(
        e instanceof Error ? e : new Error("Unknown error thrown: " + e)
      );
    }
  },

  success<T>(value: T): Result<T, never> {
    return { success: true, value };
  },

  failure<E>(error: E): Result<never, E> {
    return { success: false, error };
  },
};
