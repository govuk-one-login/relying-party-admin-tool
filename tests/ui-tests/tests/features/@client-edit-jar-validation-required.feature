Feature: Client - edit jar validation required page

  Scenario: Client - edit jar validation required page loads with expected layout
    Given I go to the "client - edit jar validation required" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit JAR validation required - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Does your client require JAR validation?"
    And the page contains the text: "If set to false, even if you send JAR, malicious party could send query params"

  Scenario: Client - edit jar validation required page validates the jar validation required
    Given I go to the "client - edit jar validation required" page
    And the page has finished loading
    And I click the "Confirm" button
    Then the error message: "Select an option" shows
    And I check the radio button: "Yes"
    And I click the "Confirm" button
    Then I am taken to the "client" page
