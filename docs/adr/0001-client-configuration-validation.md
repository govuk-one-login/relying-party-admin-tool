# ADR 0001 - Client Configuration Validation

## Context

Relying parties (RPs) will be using the One Login Admin Tool (Admin Tool) to create and update clients. The configuration of these clients will need to be validated to ensure RPs have inputted correct values. Moreover, there are certain configuration fields values that while can be valid separately, are not valid combined. It becomes a challenge in the scenario that an RP should want to update their client configuration that would involve changing two fields that have an invalid combination.

### Example

Configuration field 1 has two valid options - `A` and `B`.
Configuration field 2 has two valid options - `C` and `D`.
The client configuration is invalid if field 1 equals `A` and field 2 equals `D`.
The current client configuration is field 1 equals `A` and field 2 equals `C`. The RP would like to update their client configuration to field 1 equals `B` and field 2 equals `D`.

## Options

### Option 1 - Build a custom validator (Selected)

The Relying Party Configuration API, which will be called from the Admin Tool to make client changes, already has a custom validator. If this custom validator is reused in the Admin Tool, the Admin Tool will be able to support an RP being able to make multiple client configuration field changes in one sitting and in any order. This is because the Admin Tool will be able to validate the configuration field combinations on a separate page (a summary page) that shows after the individual configuration field edit page, as opposed to validating the configuration field combinations on the individual configuration field edit pages, which would force the RP to make the configuration field changes in a specific order that avoids the invalid configuration field combination.

### Option 2 - Use `express-validator`(Discounted)

If `express-validator` is used, an RP would not be able to make multiple client configuration field changes in any order, in one sitting. This is due to `express-validator` only being able to validate against `body`, `cookies`, `headers`, `params` or `query` from `express`'s `Request` object. Because the proposed summary page would not be a form page (unlike the individual configuration field edit pages), the request body would not be populated with the updated configuration field change, and therefore not work on the summary page. If there is no summary page and all validation (including configuration field combinations) is checked on the individual configuration field edit pages, this would mean an RP must make their changes in a specific order. Using the example above, the RP must change field 1 to `B` first, and then field 2 to `D` to avoid the invalid combination. `express-validator` could continue to be used on the configuration field form pages, alongside a custom validator on the summary page, but there would be small nuances between the two validators that may cause some configuration errors and therefore, some confusion.

## Consequences

### Benefits

- The Admin Tool will have complete control on how validation works and is applied to the client configuration.
- The Admin Tool custom validator can completely match the Relying Party Configuration API's custom validator, so there will be no mismatch in validation.

### Trade-offs

- The Relying Party Configuration API's custom validator does not associate each validation error to the field that is invalid. There will be some extra work to make that validator custom to the Admin Tool.
- The Relying Party Configuration API's custom validator does not have all the validation that the Admin Tool will require. There will be some extra work to add these extra validation rules.
- There will be some extra complexity to understand how the custom validator works compared to `express-validator`'s validator.
- The client configuration form pages have already been created using `express-validator`. There will be some extra work to convert these pages to use the custom validator.
