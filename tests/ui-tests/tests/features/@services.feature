Feature: View all services page

  Scenario: View all services page loads with expected layout
    Given I go to the "services" page
    And the page has finished loading
    Then the page meets our accessibility standards
    And the page title is "View all services - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the text: "Your services"

  Scenario: View all services page loads with the first service card
    Given I go to the "services" page
    And the page has finished loading
    Then the service: "RPAT Service 1" has a manage link
    And the service: "RPAT Service 1" has the description: "This is my service for RPAT"

  Scenario: View all services page loads with the second service card
    Given I go to the "services" page
    And the page has finished loading
    Then the service: "RPAT Service 2" has a manage link
    And the service: "RPAT Service 2" has no description

  Scenario: View all services page loads with create a new service button
    Given I go to the "services" page
    And the page has finished loading
    Then the page contains the button: "Create a new service" with the href: "/services/create"
