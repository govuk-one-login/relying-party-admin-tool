import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { sectorIdentifierUriFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditSectorIdentifierUriRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "clients/edit-sector-identifier-uri/index.njk",
        sectorIdentifierUriFieldValidator
      ),
    ];
  };
