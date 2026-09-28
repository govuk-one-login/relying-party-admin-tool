Feature: Create a new client - edit scopes page

  Scenario: Create a new client - edit scopes page loads with expected layout
    Given I go to the "create client - edit scopes" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit scopes - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Select your scopes"
    And the page contains the text: "openid will be automatically added to your scopes configuration as it is required to sign in users"

  Scenario: Create a new client - edit scopes page validates the scopes
    Given I go to the "create client - edit scopes" page
    And the page has finished loading
    And I check the checkbox: "email"
    And I click the "Continue" button
    Then I am taken to the "create client - summary" page
    And the field: "scopes" has the value: "openidemail"
    And I click the change button for: "scopes" in the "Core fields" section on the summary page
    Then I am taken to the "create client - edit scopes" page
    And the checkbox: "email" is checked
