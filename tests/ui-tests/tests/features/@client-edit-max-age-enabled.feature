Feature: Client - edit max age enabled page

  Scenario: Client - edit max age enabled page loads with expected layout
    Given I go to the "client - edit max age enabled" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit max age enabled - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Is max age enabled?"

  Scenario: Client - edit max age enabled page validates the max age enabled
    Given I go to the "client - edit max age enabled" page
    And the page has finished loading
    And I click the "Confirm" button
    Then the error message: "Select an option" shows
    And I check the radio button: "Yes"
    And I click the "Confirm" button
    Then I am taken to the "client" page
