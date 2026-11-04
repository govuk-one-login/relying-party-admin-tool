import { InMemoryCache } from "./in-memory-cache.js";

describe("in memory cache test", () => {
  const fixedUnixTimestamp = 1793808493504;
  const cache = new InMemoryCache();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedUnixTimestamp));
    cache.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("set populates the cache and get returns it", () => {
    const key = "hello";
    const item = "world";
    cache.set(key, item, 300);

    const storedItem = cache.get<string>(key);

    expect(storedItem).toStrictEqual(item);
  });

  it("get returns undefined for an unknown key", () => {
    const key = "hello";
    const item = "world";
    cache.set(key, item, 300);

    const storedItem = cache.get<string>("not-present");

    expect(storedItem).toBeUndefined();
  });

  it("get returns undefined for an expired item", () => {
    const key = "hello";
    const item = "world";
    cache.set(key, item, 300);

    // Move forward 400 seconds to force expirt
    vi.advanceTimersByTime(400 * 1000);

    const storedItem = cache.get<string>(key);

    expect(storedItem).toBeUndefined();
  });
});
