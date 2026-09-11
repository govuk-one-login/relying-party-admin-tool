import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { channelFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditChannelRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "clients/edit-channel/index.njk",
      channelFieldValidator
    ),
  ];
};
