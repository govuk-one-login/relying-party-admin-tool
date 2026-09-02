import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { backchannelLogoutUrlFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditBackchannelLogoutUrlRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "clients/edit-backchannel-logout-url/index.njk",
        backchannelLogoutUrlFieldValidator
      ),
    ];
  };
