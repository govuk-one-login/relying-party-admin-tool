Feature: Create a new client - enter redirect urls page

  Scenario: Create a new client - enter redirect urls page loads with expected layout
    Given I go to the "create client - enter redirect urls" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Enter redirect urls - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the breadcrumbs: "Your services, Service Name, Create a client"
    Then the page has the exact text: "Add a redirect URL"
    And the page has the exact text: "You need at least one redirect URL for your client to work"
    And the page has the exact text: "Redirect URLs"

  Scenario: Create a new client - enter redirect urls page validates the redirect url input
    Given I go to the "create client - enter redirect urls" page
    And the page has finished loading
    And I click the "Add" button
    Then the page contains the text: "Enter a redirect URL"
    And I enter "http://url.com" into the field "Add a redirect URL"
    And I click the "Add" button
    And the page has finished loading
    Then the table contains the text: "http://url.com"
    And I enter "http://url2.com" into the field "Add a redirect URL"
    And I click the "Add" button
    And the page has finished loading
    Then the table contains the text: "http://url2.com"
    And I click on the remove button for: "http://url.com"
    Then the table does not contains the text: "http://url.com"
    And I click the "Continue" button
    Then I am taken to the "create client - select scopes" page

  Scenario: Create a new client - enter redirect urls page validates the redirect urls table
    Given I go to the "create client - enter redirect urls" page
    And the page has finished loading
    And I click the "Continue" button
    Then the page contains the text: "You must have at least one redirect URL"
    And I enter "http://url.com" into the field "Add a redirect URL"
    And I click the "Add" button
    And the page has finished loading
    And I enter "http://url2.com" into the field "Add a redirect URL"
    And I click the "Add" button
    And the page has finished loading
    And I click on the remove button for: "http://url.com"
    And I click on the remove button for: "http://url2.com"
    And I click the "Continue" button
    Then the page contains the text: "You must have at least one redirect URL"
