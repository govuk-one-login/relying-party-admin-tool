Feature: Client - edit scopes page

  Scenario: Client - edit scopes page loads with expected layout
    Given I go to the "client - edit scopes" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit scopes - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Select your scopes"
    And the page contains the text: "openid will be automatically added to your scopes configuration as it is required to sign in users"

  Scenario: Client - edit scopes page validates the scopes
    Given I go to the "client - edit scopes" page
    And the page has finished loading
    And I check the checkbox: "email"
    And I click the "Continue" button
    Then I am taken to the "client" page
