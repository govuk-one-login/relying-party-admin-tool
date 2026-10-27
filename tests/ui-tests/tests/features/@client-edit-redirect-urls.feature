Feature: Client - edit redirect urls page

  Scenario: Client - edit redirect urls page loads with expected layout
    Given I go to the "client - edit redirect urls" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit redirect URLs - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Add a redirect URL"
    And the page has the exact text: "Redirect URLs"

  Scenario: Create a new client - redirect urls page validates the redirect url input
    Given I go to the "client - edit redirect urls" page
    And the page has finished loading
    And I click the "Add" button
    Then the error message: "Enter a redirect URL" shows
    And I enter "http://url.com" into the field "Add a redirect URL"
    And I click the "Add" button
    And the page has finished loading
    Then the table contains the text: "http://url.com"
    And I enter "url2.com" into the field "Add a redirect URL"
    And I click the "Add" button
    And the page has finished loading
    Then the error message: "Your redirect URL must be a valid URL" shows
    And the table contains the text: "http://url.com"
    And I enter "http://url2.com" into the field "Add a redirect URL"
    And I click the "Add" button
    And the page has finished loading
    Then the table contains the text: "http://url2.com"
    And I click on the url table remove button for: "http://url.com"
    Then the table does not contains the text: "http://url.com"
    And I click the "Continue" button
    Then I am taken to the "client" page
