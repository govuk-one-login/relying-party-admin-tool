Feature: Client - edit pkce enforced page

  Scenario: Client - edit pkce enforced page loads with expected layout
    Given I go to the "client - edit pkce enforced" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit is PKCE enforced - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Is PKCE enforced?"

  Scenario: Client - edit pkce enforced page validates the pkce enforced
    Given I go to the "client - edit pkce enforced" page
    And the page has finished loading
    And I click the "Confirm" button
    Then the error message: "Select an option" shows
    And I check the radio button: "Yes"
    And I click the "Confirm" button
    Then I am taken to the "client" page
