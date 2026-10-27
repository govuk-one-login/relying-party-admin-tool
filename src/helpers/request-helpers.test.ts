import { RequestBuilder } from "../utils/test-utils/builders.js";
import { getOptionalList } from "./request-helpers.js";

describe("request helpers", () => {
  describe("getOptionalList", () => {
    it("should return list when request body has list", async () => {
      const testList = ["item-1", "item-2", "item-3"];
      const req = new RequestBuilder()
        .withBody({
          "test-list": testList,
          "something-else": "something",
        })
        .build();

      const result = getOptionalList(req.body["test-list"]);

      expect(result).toStrictEqual(testList);
    });

    it("should return empty list when request body is empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = getOptionalList(req.body["test-list"]);

      expect(result).toStrictEqual([]);
    });

    it("should return list when request body has one item", async () => {
      const req = new RequestBuilder()
        .withBody({
          "test-list": "item-1",
        })
        .build();

      const result = getOptionalList(req.body["test-list"]);

      expect(result).toStrictEqual(["item-1"]);
    });
  });
});
