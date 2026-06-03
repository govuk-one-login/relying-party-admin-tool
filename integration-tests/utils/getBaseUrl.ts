import { env } from "../env.js";

export const getBaseUrl = () => {
  if (env.TEST_TARGET === "local") {
    return "http://localhost:6001";
  }
};
