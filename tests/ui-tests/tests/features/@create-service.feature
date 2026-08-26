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
    Then the error message: "Enter your service name" shows
    And I enter "My service" into the field "What is the name of your service?"
    And I click the "Continue" button
    And the page has finished loading
    Then the page title is "View my service - Admin Tool"
    And the page has the heading: "My service"

  Scenario: Create a new service page cancel button goes back to services page
    Given I go to the "create service" page
    And the page has finished loading
    And I click the "Cancel" link
    Then I am taken to the "services" page
