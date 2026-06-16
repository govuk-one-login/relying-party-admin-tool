Feature: Create a new service page

  Scenario: Create a new service page loads with expected layout
    Given I go to the "create service" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Create a new service - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page contains the text: "Test heading"
