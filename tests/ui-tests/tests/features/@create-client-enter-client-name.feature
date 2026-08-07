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
    Then the error message: "Enter your client name" shows
    And I enter "My client" into the field "What is the name of your client?"
    And I click the "Continue" button
    Then I am taken to the "create client - select client authentication" page
