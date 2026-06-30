Feature: Create a new client page

  Scenario: Create a new client page loads with expected layout
    Given I go to the "create client" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Create a new integration client - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Create a new integration client"
