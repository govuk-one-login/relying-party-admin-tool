import { AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBSessionStore } from "./dynamodb-session-store.js";
import { SessionData } from "express-session";

describe("DynamoDBSessionStore", () => {
  let client: DynamoDBClient;
  let sendStub: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z")); // 1704067200 epoch seconds
    client = new DynamoDBClient({ region: "eu-west-2" });
    sendStub = vi.spyOn(client, "send");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("get", () => {
    it("returns the parsed session when the item exists and is not expired", async () => {
      const sessionData = { cookie: { maxAge: 3600000 }, userId: "user-1" };
      sendStub.mockResolvedValueOnce({
        Item: {
          id: { S: "sess:abc123" },
          sess: { S: JSON.stringify(sessionData) },
          expires: { N: "1704070800" }, // one hour later, not expired
        },
      } as any);

      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      const session = await new Promise((resolve, reject) => {
        store.get("abc123", (err, sess) => (err ? reject(err) : resolve(sess)));
      });

      expect(session).toStrictEqual(sessionData);

      const [command] = sendStub.mock.calls[0];

      expect(command.input).toStrictEqual({
        TableName: "sessions",
        Key: { id: { S: "sess:abc123" } },
        ConsistentRead: true,
      });
    });

    it("returns null when no item is found", async () => {
      sendStub.mockResolvedValueOnce({} as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      const session = await new Promise((resolve, reject) => {
        store.get("missing", (err, sess) =>
          err ? reject(err) : resolve(sess)
        );
      });

      expect(session).toBeNull();
    });

    it("returns null when the item has expired", async () => {
      sendStub.mockResolvedValueOnce({
        Item: {
          id: { S: "sess:expired" },
          sess: { S: JSON.stringify({ cookie: {} }) },
          expires: { N: "1704063600" }, // one hour before "now"
        },
      } as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      const session = await new Promise((resolve, reject) => {
        store.get("expired", (err, sess) =>
          err ? reject(err) : resolve(sess)
        );
      });

      expect(session).toBeNull();
    });

    it("returns null when the item has no sess attribute", async () => {
      sendStub.mockResolvedValueOnce({
        Item: { id: { S: "sess:broken" } },
      } as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      const session = await new Promise((resolve, reject) => {
        store.get("broken", (err, sess) => (err ? reject(err) : resolve(sess)));
      });

      expect(session).toBeNull();
    });

    it("calls back with an error when the DynamoDB item contains malformed JSON", async () => {
      sendStub.mockResolvedValueOnce({
        Item: {
          id: { S: "sess:malformed" },
          sess: { S: "{not-json" },
        },
      } as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      const error = await new Promise((resolve) => {
        store.get("malformed", (err) => resolve(err));
      });

      expect(error).toBeInstanceOf(SyntaxError);
    });

    it("propagates DynamoDB errors via the callback", async () => {
      const dynamoError = new Error("DynamoDB is unavailable");
      sendStub.mockRejectedValueOnce(dynamoError);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      const error = await new Promise((resolve) => {
        store.get("abc123", (err) => resolve(err));
      });

      expect(error).toBe(dynamoError);
    });

    it("uses a custom hash key and prefix when provided", async () => {
      sendStub.mockResolvedValueOnce({} as any);
      const store = new DynamoDBSessionStore({
        client,
        tableName: "sessions",
        hashKey: "pk",
        prefix: "custom:",
      });

      await new Promise((resolve) => store.get("abc123", () => resolve(null)));

      const [command] = sendStub.mock.calls[0];

      expect(command.input.Key).toStrictEqual({ pk: { S: "custom:abc123" } });
    });
  });

  describe("set", () => {
    it("writes the session with expires derived from cookie.maxAge", async () => {
      sendStub.mockResolvedValueOnce({} as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });
      const session = {
        cookie: {
          maxAge: 3600000,
        },
      }; // 1 hour

      await new Promise((resolve, reject) => {
        store.set("abc123", session as SessionData, (err) =>
          err ? reject(err) : resolve(undefined)
        );
      });

      const [command] = sendStub.mock.calls[0];

      expect(command.input).toStrictEqual({
        TableName: "sessions",
        Item: {
          id: { S: "sess:abc123" },
          expires: { N: "1704070800" }, // now + 3600s
          sess: { S: JSON.stringify(session) },
        },
      });
    });

    it("defaults expires to one day when cookie.maxAge is absent", async () => {
      sendStub.mockResolvedValueOnce({} as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });
      const session = { cookie: {} };

      await new Promise((resolve, reject) => {
        store.set("abc123", session as SessionData, (err) =>
          err ? reject(err) : resolve(undefined)
        );
      });

      const [command] = sendStub.mock.calls[0];

      expect(command.input.Item.expires).toStrictEqual({ N: "1704153600" }); // now + 1 day
    });

    it("respects a custom defaultTtlSeconds", async () => {
      sendStub.mockResolvedValueOnce({} as any);
      const store = new DynamoDBSessionStore({
        client,
        tableName: "sessions",
        defaultTtlSeconds: 60,
      });
      const session = { cookie: {} };

      await new Promise((resolve, reject) => {
        store.set("abc123", session as SessionData, (err) =>
          err ? reject(err) : resolve(undefined)
        );
      });

      const [command] = sendStub.mock.calls[0];

      expect(command.input.Item.expires).toStrictEqual({ N: "1704067260" }); // now + 60s
    });

    it("includes extra attributes returned by the extraAttributes mapper", async () => {
      sendStub.mockResolvedValueOnce({} as any);
      const store = new DynamoDBSessionStore({
        client,
        tableName: "sessions",
        extraAttributes: (sess) =>
          sess.userId
            ? ({ userId: { S: sess.userId } } as Record<string, AttributeValue>)
            : {},
      });
      const session = { cookie: { maxAge: 1000 }, userId: "user-42" };

      await new Promise((resolve, reject) => {
        store.set("abc123", session as SessionData, (err) =>
          err ? reject(err) : resolve(undefined)
        );
      });

      const [command] = sendStub.mock.calls[0];

      expect(command.input.Item.userId).toStrictEqual({ S: "user-42" });
    });

    it("omits extra attributes when the mapper returns an empty object", async () => {
      sendStub.mockResolvedValueOnce({} as any);
      const store = new DynamoDBSessionStore({
        client,
        tableName: "sessions",
        extraAttributes: (sess) =>
          sess.userId
            ? ({ userId: { S: sess.userId } } as Record<string, AttributeValue>)
            : {},
      });
      const session = { cookie: { maxAge: 1000 } };

      await new Promise((resolve, reject) => {
        store.set("abc123", session as SessionData, (err) =>
          err ? reject(err) : resolve(undefined)
        );
      });

      const [command] = sendStub.mock.calls[0];

      expect(command.input.Item.userId).toBeUndefined();
    });

    it("propagates DynamoDB errors via the callback", async () => {
      const dynamoError = new Error("write failed");
      sendStub.mockRejectedValueOnce(dynamoError);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      const error = await new Promise((resolve) => {
        store.set("abc123", { cookie: {} } as SessionData, (err) =>
          resolve(err)
        );
      });

      expect(error).toBe(dynamoError);
    });

    it("works without an explicit callback", async () => {
      sendStub.mockResolvedValueOnce({} as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      expect(() =>
        store.set("abc123", { cookie: {} } as SessionData)
      ).not.toThrow();
    });
  });

  describe("destroy", () => {
    it("deletes the session item by prefixed sid", async () => {
      sendStub.mockResolvedValueOnce({} as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      await new Promise((resolve, reject) => {
        store.destroy("abc123", (err) =>
          err ? reject(err) : resolve(undefined)
        );
      });

      const [command] = sendStub.mock.calls[0];

      expect(command.input).toStrictEqual({
        TableName: "sessions",
        Key: { id: { S: "sess:abc123" } },
      });
    });

    it("propagates DynamoDB errors via the callback", async () => {
      const dynamoError = new Error("delete failed");
      sendStub.mockRejectedValueOnce(dynamoError);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      const error = await new Promise((resolve) => {
        store.destroy("abc123", (err) => resolve(err));
      });

      expect(error).toBe(dynamoError);
    });

    it("works without an explicit callback", async () => {
      sendStub.mockResolvedValueOnce({} as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      expect(() => store.destroy("abc123")).not.toThrow();
    });
  });

  describe("touch", () => {
    it("updates the expires attribute and returns the new value", async () => {
      sendStub.mockResolvedValueOnce({
        Attributes: { expires: { N: "1704070800" } },
      } as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });
      const session = { cookie: { maxAge: 3600000 } };

      const result = await new Promise((resolve, reject) => {
        store.touch("abc123", session as SessionData, (err, data) =>
          err ? reject(err) : resolve(data)
        );
      });

      expect(result).toStrictEqual({ expires: "1704070800" });

      const [command] = sendStub.mock.calls[0];

      expect(command.input).toStrictEqual({
        TableName: "sessions",
        Key: { id: { S: "sess:abc123" } },
        UpdateExpression: "set expires = :e",
        ExpressionAttributeValues: { ":e": { N: "1704070800" } },
        ReturnValues: "UPDATED_NEW",
      });
    });

    it("propagates DynamoDB errors via the callback", async () => {
      const dynamoError = new Error("touch failed");
      sendStub.mockRejectedValueOnce(dynamoError);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      const error = await new Promise((resolve) => {
        store.touch("abc123", { cookie: {} } as SessionData, (err) =>
          resolve(err)
        );
      });

      expect(error).toBe(dynamoError);
    });

    it("works without an explicit callback", async () => {
      sendStub.mockResolvedValueOnce({
        Attributes: { expires: { N: "1704070800" } },
      } as any);
      const store = new DynamoDBSessionStore({ client, tableName: "sessions" });

      expect(() =>
        store.touch("abc123", { cookie: {} } as SessionData)
      ).not.toThrow();
    });
  });
});
