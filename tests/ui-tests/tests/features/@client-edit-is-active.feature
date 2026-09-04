Feature: Client - edit is active page

  Scenario: Client - edit is active page loads with expected layout
    Given I go to the "client - edit is active" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit is active - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Is your client active?"
    And the page contains the text: "Disabling this will stop all one login journeys"

  Scenario: Client - edit is active page validates the is active
    Given I go to the "client - edit is active" page
    And the page has finished loading
    And I click the "Confirm" button
    Then the error message: "Select an option" shows
    And I check the radio button: "Yes"
    And I click the "Confirm" button
    Then I am taken to the "client" page
