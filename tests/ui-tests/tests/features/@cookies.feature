Feature: Cookies page

  Scenario: Cookies page loads with expected layout
    Given I go to the "Cookies" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Cookies - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Essential cookies"