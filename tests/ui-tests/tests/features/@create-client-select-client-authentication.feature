Feature: Create a new client - select client authentication page

  Scenario: Create a new client - select client authentication page loads with expected layout
    Given I go to the "create client - select client authentication" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Select token authentication method - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the breadcrumbs: "Your services, Service Name, Create a client"
    Then the page has the heading: "Token authentication method"
    And the page contains the text: "If client secret is selected, you will be unable to request identity verification"
    And the page contains the text: "How do you want to authenticate?"

  Scenario: Create a new client - select client authentication page validates client authentication
    Given I go to the "create client - select client authentication" page
    And the page has finished loading
    And I click the "Continue" button
    Then the error message: "Choose a token authentication method" shows
    And I check the radio button: "Public key URL (JWKS)"
    And I enter "not-a-url" into the field "JWKS endpoint URL"
    And I click the "Continue" button
    Then the error message: "Please enter a valid URL" shows
    And I enter "http://url.com" into the field "JWKS endpoint URL"
    And I click the "Continue" button
    Then I am taken to the "create client - enter redirect urls" page
