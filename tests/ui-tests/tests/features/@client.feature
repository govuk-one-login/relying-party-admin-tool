Feature: View a client page

  Scenario: View a client page loads with expected layout
    Given I go to the "client" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "View client - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "View client details"

  Scenario: View a client page validates filled client config
    Given I go to the "client" page
    And the page has finished loading
    Then the field: "client-name" has the value: "test-client"
    Then the field: "client-id" has the value: "random-client-id"
    And the field: "identity-verification-supported" has the value: "false"
    And the field: "client-authentication-method" has the value: "JWKS"
    And the field: "jwks-endpoint" has the value: "https://example1.com"
    And the field: "token-authentication-method" has the value: "private_key_jwt"
    And the field: "redirect-urls" has the value: "https://example2.com"
    And the field: "scopes" has the value: "openidemail"
    And the field: "claims" has the value: "Not set"
    And the field: "landing-page-url" has the value: "Not set"
    And the field: "levels-of-confidence" has the value: "P0"
    And the field: "sector-identifier-uri" has the value: "https://example3.com"
    And the field: "is-active" has the value: "true"
    And the field: "id-token-signing-algorithm" has the value: "ES256"
    And the field: "post-logout-redirect-urls" has the value: "Not set"
    And the field: "backchannel-logout-uri" has the value: "Not set"
    And the field: "service-type" has the value: "MANDATORY"
    And the field: "jar-validation-required" has the value: "false"
    And the field: "channel" has the value: "web"
    And the field: "pkce-enforced" has the value: "false"
    And the field: "max-age-enabled" has the value: "false"
    And the field: "permit-missing-nonce" has the value: "false"
    And the field: "rate-limit" has the value: "1 per minute"
