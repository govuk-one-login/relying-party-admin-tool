Feature: Client - edit channel page

  Scenario: Client - edit channel page loads with expected layout
    Given I go to the "client - edit channel" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit channel - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "What format is your client?"
    And the page has the exact text: "Web"
    And the page has the exact text: "App"

  Scenario: Client - edit channel page validates the channel
    Given I go to the "client - edit channel" page
    And the page has finished loading
    And I click the "Confirm" button
    Then the error message: "Channel is required" shows
    And I check the radio button: "Web"
    And I click the "Confirm" button
    Then I am taken to the "client" page

# TODO: add test to check strategic app shows when test clients are set up
