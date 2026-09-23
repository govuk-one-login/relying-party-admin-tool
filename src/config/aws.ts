import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import {
  isLocalEnv,
  getAwsRegion,
  getDynamoDBLocalBaseUrl,
} from "../config.js";

export interface Credentials {
  accessKeyId?: string;
  secretAccessKey?: string;
}

const getDynamoDBLocalAWSConfig = (): Partial<DynamoDBClientConfig> => {
  return {
    endpoint: getDynamoDBLocalBaseUrl(),
    region: getAwsRegion(),
  };
};

export const getAWSConfig = (): Partial<DynamoDBClientConfig> => {
  if (isLocalEnv()) {
    return getDynamoDBLocalAWSConfig();
  }

  return {
    region: getAwsRegion(),
  };
};
