Feature: 500 error page

  Scenario: 500 error page loads with expected layout
    Given I go to the "500 error" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Sorry, there is a problem with the service - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Sorry, there is a problem with the service."
    And the page contains the text: "Try again later."
