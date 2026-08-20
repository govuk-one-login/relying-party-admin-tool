import type { Request } from "express";
import { RequestBuilder } from "../utils/test-utils/builders.js";
import { getListFromRequestBody } from "./request-helpers.js";

describe("request helpers", () => {
  describe("getListFromRequestBody", () => {
    it("should return list when request body has list", async () => {
      const testList = ["item-1", "item-2", "item-3"];
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "test-list": testList,
          "something-else": "something",
        })
        .build();

      const result = getListFromRequestBody(req as Request, "test-list");

      expect(result).toStrictEqual(testList);
    });

    it("should return empty list when request body is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder().withBody({}).build();

      const result = getListFromRequestBody(req as Request, "test-list");

      expect(result).toStrictEqual([]);
    });

    it("should return list when request body has one item", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "test-list": "item-1",
        })
        .build();

      const result = getListFromRequestBody(req as Request, "test-list");

      expect(result).toStrictEqual(["item-1"]);
    });
  });
});
