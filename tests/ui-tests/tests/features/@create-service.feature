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
    And I enter "My service" into the field "What is the name of your service?"
    And I click the "Continue" button
    Then I am taken to the "service" page

  Scenario: Create a new service page validates the service description against invalid inputs
    Given I go to the "create service" page
    And the page has finished loading
    And I enter "🆕" into the field "Describe your service"
    And I click the "Continue" button
    Then the page contains the text: "Your service description must only use ASCII characters"
    And I enter "My service" into the field "What is the name of your service?"
    And I enter "My description" into the field "Describe your service"
    And I click the "Continue" button
    Then I am taken to the "service" page
