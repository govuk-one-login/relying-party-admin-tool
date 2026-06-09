Feature: Test page load

  Scenario: Testing page loads with text
    Given I go to the "home" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Home - Admin Tool"
    Then the page contains the text: "Hello World!"

  Scenario: Header shows
    Given I go to the "home" page
    And the page has finished loading
    Then the header links to the home page
