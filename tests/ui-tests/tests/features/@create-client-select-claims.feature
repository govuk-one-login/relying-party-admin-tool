Feature: Create a new client - select claims page

  Scenario: Create a new client - select claims page loads with expected layout
    Given I go to the "create client - select claims" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Select claims - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Select your claims"
    And the page contains the text: "Select all that apply"

  Scenario: Create a new client - select claims page validates the claims
    Given I go to the "create client - select claims" page
    And the page has finished loading
    And I check the checkbox: "https://vocab.account.gov.uk/v1/coreIdentityJWT"
    And I check the checkbox: "https://vocab.account.gov.uk/v1/drivingPermit"
    And I click the "Continue" button
    Then I am taken to the "create client - enter landing page url" page
