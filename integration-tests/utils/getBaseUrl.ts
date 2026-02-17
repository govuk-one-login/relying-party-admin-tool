import { env } from "../env";

export const getBaseUrl = () => {
  if (env.TEST_TARGET === "local") {
    return "http://localhost:3000";
  }
};
