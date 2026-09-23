import {
  isLocalEnv,
  getAwsRegion,
  getDynamoDBLocalBaseUrl,
} from "../config.js";

export interface Credentials {
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface AwsConfig {
  endpoint?: string;
  credentials?: Credentials;
  region: string;
}

function getDynamoDBLocalAWSConfig(): AwsConfig {
  return {
    endpoint: getDynamoDBLocalBaseUrl(),
    credentials: {
      accessKeyId: "na",
      secretAccessKey: "na", //pragma: allowlist secret
    },
    region: getAwsRegion(),
  };
}

export function getAWSConfig(): AwsConfig {
  if (isLocalEnv()) {
    return getDynamoDBLocalAWSConfig();
  }

  return {
    region: getAwsRegion(),
  };
}
