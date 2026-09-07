import type { Store } from "express-session";
import session from "express-session";
import connectDynamoDB from "connect-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const DynamoDBStore = connectDynamoDB(session);

const dynamoDBCientSessions = new DynamoDBClient({
  region: "eu-west-2",
  ...(process.env.DYNAMO_ENDPOINT && {
    endpoint: process.env.DYNAMO_ENDPOINT,
  }),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

export const tableName = `${process.env.ENVIRONMENT ?? "test"}-frontend-sessions`;

export const getSessionStore = (): Store => {
  return new DynamoDBStore({
    table: tableName,
    hashKey: "id",
    prefix: "",
    client: new DynamoDBClient(dynamoDBCientSessions),
    initialized: true,
  });
};
