Feature: Create a new client - select scopes page

  Scenario: Create a new client - select scopes page loads with expected layout
    Given I go to the "create client - select scopes" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Select scopes - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the breadcrumbs: "Your services, Service Name, Create a client"
    Then the page has the heading: "Select your scopes"
    And the page contains the text: "openid will be automatically added to your scopes configuration as it is required to sign in users"

  Scenario: Create a new client - select scopes page validates the scopes
    Given I go to the "create client - select scopes" page
    And the page has finished loading
    And I check the checkbox: "email"
    And I click the "Continue" button
    Then I am taken to the "create client - support identity verification" page
