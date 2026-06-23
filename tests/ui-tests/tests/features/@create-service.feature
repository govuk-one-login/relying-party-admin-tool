Feature: Create a new service page

  Scenario: Create a new service page loads with expected layout
    Given I go to the "create service" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Create a new service - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "What is the name of your service?"

  Scenario: Create a new service page validates the service name
    Given I go to the "create service" page
    And the page has finished loading
    And I click the "Continue" button
    Then the page contains the text: "Enter your service name"
    And I enter " " into the field "What is the name of your service?"
    And I click the "Continue" button
    Then the page contains the text: "Enter your service name"
    And I enter "🆕 service" into the field "What is the name of your service?"
    And I click the "Continue" button
    Then the page contains the text: "Your service name must only use ASCII characters"
    And I enter "My service" into the field "What is the name of your service?"
    And I click the "Continue" button
    Then I am taken to the "home" page

  Scenario: Create a new service page validates the service description against invalid inputs
    Given I go to the "create service" page
    And the page has finished loading
    And I enter "🆕" into the field "Describe your service"
    And I click the "Continue" button
    Then the page contains the text: "Your service description must only use ASCII characters"
    And I enter "11111111112222222222333333333344444444445555555555666666666677777777778888888888999999999900000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222223333333333444444444455555555556666666" into the field "Describe your service"
    And I click the "Continue" button
    Then the page contains the text: "Your service description must be less than 256 characters"
    And I enter "My service" into the field "What is the name of your service?"
    And I enter "My description" into the field "Describe your service"
    And I click the "Continue" button
    Then I am taken to the "home" page
