Feature: Test page load

  Scenario: Testing page loads with text
    Given I go to the "home" page
    And the page contains the text: "Hello World!"