Feature: Client - edit sector identifier uri page

  Scenario: Client - edit sector identifier uri page loads with expected layout
    Given I go to the "client - edit sector identifier uri" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit sector identifier URI - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "What is your client's sector identifier?"
    And the page contains the text: "Changing this will change all user IDs for users of your client"

  Scenario: Create a new client - sector identifier uri page validates the redirect url input
    Given I go to the "client - edit sector identifier uri" page
    And the page has finished loading
    And I click the "Confirm" button
    Then the error message: "Enter a sector identifier URI" shows
    And I enter "http://url.com" into the textbox
    And I click the "Confirm" button
    Then I am taken to the "client" page
