Feature: Create a new client - edit client authentication page

  Scenario: Create a new client - edit client authentication page loads with expected layout
    Given I go to the "create client - edit client authentication" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit client authentication method - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Client authentication method"
    And the page contains the text: "If client secret is selected, you will be unable to request identity verification"
    And the page contains the text: "How do you want to authenticate?"

  Scenario: Create a new client - edit client authentication page validates client authentication
    Given I go to the "create client - edit client authentication" page
    And the page has finished loading
    And I click the "Continue" button
    Then the error message: "Choose a client authentication method" shows
    And I check the radio button: "Public key URL (JWKS)"
    And I enter "not-a-url" into the field "JWKS endpoint URL"
    And I click the "Continue" button
    Then the error message: "Your JWKS URL must be a valid URL" shows
    And I enter "http://url.com" into the field "JWKS endpoint URL"
    And I click the "Continue" button
    Then I am taken to the "create client - summary" page
    And the field: "jwks-endpoint" has the value: "http://url.com"
    And the field: "client-authentication-method" has the value: "Public key URL (JWKS)"
    And I click the change button for: "client authentication method" in the "Core fields" section on the summary page
    Then I am taken to the "create client - edit client authentication" page
    And the field input: "jwks-endpoint" has the value: "http://url.com"
    And I check the radio button: "Client secret"
    And I enter "clientsecret" into the field "Client secret"
    And I click the "Continue" button
    Then I am taken to the "create client - summary" page
    And the field: "client-secret" has the value: "clientsecret"
    And the field: "client-authentication-method" has the value: "Client secret"
    And I click the change button for: "client secret" in the "Core fields" section on the summary page
    Then I am taken to the "create client - edit client authentication" page
