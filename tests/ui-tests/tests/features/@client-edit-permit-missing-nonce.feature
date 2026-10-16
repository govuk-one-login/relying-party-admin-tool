Feature: Client - edit permit missing nonce page

  Scenario: Client - edit permit missing nonce page loads with expected layout
    Given I go to the "client - edit permit missing nonce" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit permit missing nonce - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Allow missing nonce?"

  Scenario: Client - edit permit missing nonce page validates the permit missing nonce
    Given I go to the "client - edit permit missing nonce" page
    And the page has finished loading
    And I click the "Confirm" button
    Then the error message: "Select an option" shows
    And I check the radio button: "Yes"
    And I click the "Confirm" button
    Then I am taken to the "client" page
