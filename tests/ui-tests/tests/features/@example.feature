Feature: Test page

  Scenario: Testing page loads with text
    Given I go to the "home" page
    And the page has finished loading
    Then the page meets our accessibility standards
    And the page title is "Home - Admin Tool"
    And the page contains the text: "Hello World!"

  Scenario: Header shows
    Given I go to the "home" page
    And the page has finished loading
    Then the header links to the home page

  Scenario: Navigation bar shows
    Given I go to the "home" page
    And the page has finished loading
    Then the navigation bar shows with correct urls

  Scenario: Footer shows
    Given I go to the "home" page
    And the page has finished loading
    Then the footer shows with correct urls
