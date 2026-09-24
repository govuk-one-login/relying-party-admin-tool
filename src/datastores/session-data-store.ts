import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { getSessionExpiry } from "../config.js";
import { Store } from "express-session";
import { dynamoClient } from "../utils/dynamo.js";
import { DynamoDBSessionStore } from "../utils/dynamodb-session-store.js";

// the value of the USER_IDENTIFIER_IDX_ATTRIBUTE must match the indexed attribute in SessionsDynamoDB table
// defined in `../../deploy/template.yaml`.
const USER_IDENTIFIER_IDX_ATTRIBUTE = "userId";

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
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      extraAttributes: (sess) =>
        sess?.[USER_IDENTIFIER_IDX_ATTRIBUTE]
          ? ({
              [USER_IDENTIFIER_IDX_ATTRIBUTE]: {
                S: sess[USER_IDENTIFIER_IDX_ATTRIBUTE],
              },
            } as Record<string, AttributeValue>)
          : {},
    });
  }

  return sessionStoreInstance!;
}
