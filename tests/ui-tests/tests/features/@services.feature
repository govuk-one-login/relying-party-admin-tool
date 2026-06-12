Feature: View all services page load

  Scenario: View all services page loads with expected layout
    Given I go to the "services" page
    And the page has finished loading
    Then the page meets our accessibility standards
    And the page title is "View all services - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the text: "Your services"
