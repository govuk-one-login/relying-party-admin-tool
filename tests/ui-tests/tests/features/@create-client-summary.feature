Feature: Create a new client - summary page

  Scenario: Create a new client - summary page loads with expected layout
    Given I go to the "create client - summary" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Create client summary - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the breadcrumbs: "Your services, Service Name, Create a client"
    Then the page has the heading: "Check these details before creating your client"
    And the field: "name" has the value: "Not set"
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

  Scenario: Create a new client - summary page validates filled auth only client config
    Given I go to the "create client - enter client name" page
    And the page has finished loading
    And I enter "My client" into the field "What is the name of your client?"
    And I click the "Continue" button
    Then I am taken to the "create client - select client authentication" page
    And I check the radio button: "Client secret"
    And I enter "client-secret" into the field "Client secret"
    And I click the "Continue" button
    Then I am taken to the "create client - enter redirect urls" page
    And the page has finished loading
    And I enter "http://url.com" into the field "Add a redirect URL"
    And I click the "Add" button
    And the page has finished loading
    And I click the "Continue" button
    Then I am taken to the "create client - select scopes" page
    And I click the "Continue" button
    Then I am taken to the "create client - support identity verification" page
    And I check the radio button: "No"
    And I click the "Continue" button
    Then I am taken to the "create client - summary" page
    And the page has finished loading
    And the field: "name" has the value: "My client"
    And the field: "client-authentication-method" has the value: "Client secret"
    And the field: "client-secret" has the value: "client-secret"
    And the field: "token-authentication-method" has the value: "Client secret post"
    And the field: "redirect-urls" has the value: "http://url.com"
    And I click the "Create client" button
    Then I am taken to the "create client - success" page
