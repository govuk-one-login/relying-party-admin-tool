Feature: Create a new client - enter client name page

  Scenario: Create a new client - enter client name page loads with expected layout
    Given I go to the "create client - enter client name" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Enter client name - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the breadcrumbs: "Your services, Service Name, Create a client"
    Then the page has the heading: "What is the name of your client?"

  Scenario: Create a new client - enter client name page validates the client name
    Given I go to the "create client - enter client name" page
    And the page has finished loading
    And I click the "Continue" button
    Then the page contains the text: "Enter your client name"
    And I enter " " into the field "What is the name of your client?"
    And I click the "Continue" button
    Then the page contains the text: "Enter your client name"
    And I enter "🆕 client" into the field "What is the name of your client?"
    And I click the "Continue" button
    Then the page contains the text: "Your client name must only use ASCII characters"
    And I enter "11111111112222222222333333333344444444445555555555666666666677777777778888888888999999999900000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222223333333333444444444455555555556666666" into the field "What is the name of your client?"
    And I click the "Continue" button
    Then the page contains the text: "Your client name must be less than 255 characters"
    And I enter ":Client" into the field "What is the name of your client?"
    And I click the "Continue" button
    Then the page contains the text: "Your client name cannot start with ':'"
    And I enter "My client" into the field "What is the name of your client?"
    And I click the "Continue" button
    Then I am taken to the "create client - select client authentication" page
