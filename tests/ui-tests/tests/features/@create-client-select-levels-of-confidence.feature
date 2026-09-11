Feature: Create a new client - select levels of confidence page

  Scenario: Create a new client - select levels of confidence page loads with expected layout
    Given I go to the "create client - select levels of confidence" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Select levels of confidence - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the breadcrumbs: "Your services, Service Name, Create a client"
    Then the page has the heading: "Which level(s) of confidence does your client require?"
    And the page contains the text: "Select all that apply"

  Scenario: Create a new client - select levels of confidence page validates the levels of confidence
    Given I go to the "create client - select levels of confidence" page
    And I click the "Continue" button
    Then the error message: "You must select one level of confidence" shows
    And I check the checkbox: "P0"
    And I click the "Continue" button
    Then I am taken to the "create client - summary" page
