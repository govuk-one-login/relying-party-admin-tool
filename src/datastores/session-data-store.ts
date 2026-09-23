import { getSessionExpiry } from "../config.js";
import { Store } from "express-session";
import { dynamoClient } from "../utils/dynamo.js";
import { DynamoDBSessionStore } from "../utils/dynamodb-session-store.js";

const tableName = `${process.env.ENVIRONMENT ?? "test"}-frontend-sessions`;

const PREFIX = "sess:";

let sessionStoreInstance: Store | null = null;

export function getSessionStore(): Store {
  if (!sessionStoreInstance) {
    sessionStoreInstance = new DynamoDBSessionStore({
      client: dynamoClient,
      tableName,
      prefix: PREFIX,
      defaultTtlSeconds: Math.floor(getSessionExpiry() / 1000),
    });
  }

  return sessionStoreInstance!;
}
