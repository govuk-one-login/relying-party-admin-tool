Feature: Create a new client - summary page

  Scenario: Create a new client - summary page loads with expected layout
    Given I go to the "create client - summary" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Create client summary - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Check these details before creating your client"
    And the field: "client-name" has the value: "Not set"
    And the field: "client-authentication-method" has the value: "Not set"
    And the field: "token-authentication-method" has the value: "Not set"
    And the field: "redirect-urls" has the value: "Not set"

  Scenario: Create a new client - summary page validates empty client config
    Given I go to the "create client - summary" page
    And the page has finished loading
    And I click the "Create client" button
    Then the error message: "Enter your client name" shows
    And the error message: "You must set a client authentication method" shows
    And the error message: "You must have at least one redirect URL" shows
    And the error message: 'Scopes must contain "openid"' shows
    And the error message: "Choose an option to support identity verification or not" shows

  Scenario: Create a new client - summary page validates filled auth only client config
    Given I go to the "create client - enter client name" page
    And the page has finished loading
    And I enter "My client" into the field "What is the name of your client?"
    And I click the "Continue" button
    Then I am taken to the "create client - select client authentication" page
    And I check the radio button: "Public key URL (JWKS)"
    And I enter "http://url1.com" into the field "JWKS endpoint URL"
    And I click the "Continue" button
    Then I am taken to the "create client - enter redirect urls" page
    And the page has finished loading
    And I enter "http://url2.com" into the field "Add a redirect URL"
    And I click the "Add" button
    And the page has finished loading
    And I click the "Continue" button
    Then I am taken to the "create client - select scopes" page
    And I check the checkbox: "email"
    And I click the "Continue" button
    Then I am taken to the "create client - support identity verification" page
    And I check the radio button: "Yes"
    And I click the "Continue" button
    Then I am taken to the "create client - select claims" page
    And I check the checkbox: "https://vocab.account.gov.uk/v1/coreIdentityJWT"
    And I click the "Continue" button
    Then I am taken to the "create client - enter landing page url" page
    And I enter "http://url3.com" into the field "Enter landing page URL for your client"
    And I click the "Continue" button
    Then I am taken to the "create client - select levels of confidence" page
    And I check the checkbox: "P2"
    And I click the "Continue" button
    Then I am taken to the "create client - summary" page
    And the page has finished loading
    And the field: "client-name" has the value: "My client"
    And the field: "identity-verification-supported" has the value: "true"
    And the field: "client-authentication-method" has the value: "JWKS"
    And the field: "jwks-endpoint" has the value: "http://url1.com"
    And the field: "token-authentication-method" has the value: "private_key_jwt"
    And the field: "redirect-urls" has the value: "http://url2.com"
    And the field: "scopes" has the value: "openidemail"
    And the field: "claims" has the value: "https://vocab.account.gov.uk/v1/coreIdentityJWT"
    And the field: "landing-page-url" has the value: "http://url3.com"
    And the field: "levels-of-confidence" has the value: "P2"
    And I click the "Create client" button
    Then I am taken to the "create client - success" page
