import request from "supertest";
import { load } from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { createApp } from "../../../src/app.js";

describe("Integration:: root page", () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
    app = undefined;
  });

  test("should return root page", async () => {
    const res = await request(app).get(PATH_NAMES.HEALTHCHECK);
    expect(res.statusCode).toBe(200);
  });
});
