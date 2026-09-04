Feature: Client - edit ID token signing algorithm page

  Scenario: Client - edit ID token signing algorithm page loads with expected layout
    Given I go to the "client - edit id token signing algorithm" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit ID token signing algorithm - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Which signing algorithm does your client use?"

  Scenario: Client - edit ID token signing algorithm page validates the ID token signing algorithm
    Given I go to the "client - edit id token signing algorithm" page
    And the page has finished loading
    And I click the "Confirm" button
    Then the error message: "ID token signing algorithm is required" shows
    And I check the radio button: "ES256"
    And I click the "Confirm" button
    Then I am taken to the "client" page
