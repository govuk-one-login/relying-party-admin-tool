Feature: Create a new client - enter landing page url page

  Scenario: Create a new client - enter landing page url page loads with expected layout
    Given I go to the "create client - enter landing page url" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Enter landing page URL - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the breadcrumbs: "Your services, Service Name, Create a client"
    Then the page has the heading: "Enter landing page URL for your client"

  Scenario: Create a new client - enter landing page url page validates the client name
    Given I go to the "create client - enter landing page url" page
    And the page has finished loading
    And I enter "Not a url" into the field "Enter landing page URL for your client"
    And I click the "Continue" button
    Then the error message: "Your landing page URL must be a valid URL" shows
    And I click the "Continue" button
    Then I am taken to the "create client - select levels of confidence" page
