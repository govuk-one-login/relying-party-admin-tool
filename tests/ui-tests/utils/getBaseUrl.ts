import { env } from "../env";

export const getBaseUrl = () => {
  if (env.TEST_TARGET === "local") {
    return "http://localhost:6001/";
  }

  if (env.TEST_TARGET === "production") {
    return "https://manage.sign-in.service.gov.uk";
  }

  if (env.TEST_TARGET === "dev") {
    return "https://manage.development.sign-in.service.gov.uk";
  }

  return `https://manage.${env.TEST_TARGET}.sign-in.service.gov.uk`;
};
