import { isLocalEnv, getAwsRegion, getFlociBaseUrl } from "../config.js";

export interface Credentials {
  accessKeyId?: string;
  secretAccessKey?: string;
}

const getFlociAWSConfig = (): { endpoint: string; region: string } => {
  return {
    endpoint: getFlociBaseUrl(),
    region: getAwsRegion(),
  };
};

export const getAWSConfig = (): Partial<{
  endpoint: string;
  region: string;
}> => {
  if (isLocalEnv()) {
    return getFlociAWSConfig();
  }

  return {
    region: getAwsRegion(),
  };
};
