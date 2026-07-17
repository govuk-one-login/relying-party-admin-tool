Feature: View service page

  Scenario: View service page loads with expected layout
    Given I go to the "service" page
    And the page has finished loading
    Then the page meets our accessibility standards
    And the page title is "View service name - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the breadcrumbs: "Your services, Service name"
    And the page has the heading: "Service name"
    And the page has the exact text: "Production Client"
    And the page has the exact text: "Status"
    And the page has the exact text: "Not yet created"
    And the page has the exact text: "You do not have a production client yet. When you have completed testing with an integration client you can request to go live."
    And the page has the exact text: "Integration Clients"
    And the page has the exact text: "You do not have any integration clients yet."
    Then the page contains the button: "Create a new integration client" with the href: "/services/serviceId/clients/create"
