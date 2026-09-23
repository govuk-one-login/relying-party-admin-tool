import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { getAWSConfig } from "../config/aws.js";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const awsConfig: Partial<DynamoDBClientConfig> = getAWSConfig();

export const dynamoClient = new DynamoDBClient(awsConfig);
export const dynamoDocClient = DynamoDBDocument.from(dynamoClient);
