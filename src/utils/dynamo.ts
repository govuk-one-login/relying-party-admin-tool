import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getAWSConfig, AwsConfig } from "../config/aws.js";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const awsConfig: AwsConfig = getAWSConfig();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dynamoClient = new DynamoDBClient(awsConfig as any);
export const dynamoDocClient = DynamoDBDocument.from(dynamoClient);
