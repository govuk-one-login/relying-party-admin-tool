import { PATH_NAMES } from "../../app.constants.js";
import {
  mockResponse,
  RequestBuilder,
} from "../../utils/test-utils/builders.js";
import { callbackController } from "./callback.js";

describe("callback controller tests", () => {
  it("sets the user as authenticated and sets the user ID on the session", async () => {
    const req = new RequestBuilder().withQueryParams({}).build();
    const res = mockResponse();

    await callbackController(req, res);

    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["SERVICES"]);
    expect(req.session.isAuthenticated).toBe(true);
    expect(req.session.userId).toBe("userId");
  });

  it("redirects to an error page if an error is returned from the OIDC provider", async () => {
    const errors = {
      error: "invalid_request",
      error_description: "Invalid request object",
    };
    const req = new RequestBuilder().withQueryParams(errors).build();
    const res = mockResponse();

    await callbackController(req, res);

    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
    expect(req.session.isAuthenticated).toBeUndefined();
    expect(req.session.userId).toBeUndefined();
  });
});
