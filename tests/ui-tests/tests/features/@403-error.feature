Feature: 403 page

  Scenario: 403 page loads with expected layout
    Given I go to the "403 error" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Forbidden - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Forbidden"
    And the page contains the text: "You do not have access to this page."
    And the page contains the text: "If you typed the web address, check it is correct."
    And the page contains the text: "If you pasted the web address, check you copied the entire address."
    And I click the "Sign in to One Login Admin" button
    Then I am taken to the "home" page
