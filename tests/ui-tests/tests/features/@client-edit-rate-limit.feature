Feature: Client - edit rate limit page

  Scenario: Client - edit rate limit page loads with expected layout
    Given I go to the "client - edit rate limit" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit rate limit - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "What is your rate limit?"

  Scenario: Client - edit rate limit page validates the rate limit
    Given I go to the "client - edit rate limit" page
    And the page has finished loading
    And I enter "test" into the field "What is your rate limit?"
    And I click the "Confirm" button
    Then the error message: "Rate limit must be a number" shows
    And I enter "2" into the field "What is your rate limit?"
    And I click the "Confirm" button
    Then I am taken to the "client" page
