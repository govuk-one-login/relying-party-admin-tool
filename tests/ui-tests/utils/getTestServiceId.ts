import { env } from "../env";

export const getTestServiceId = (): string => {
  return env.TEST_SERVICE_ID ?? "12345";
};
