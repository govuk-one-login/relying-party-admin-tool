Feature: Client - edit service type page

  Scenario: Client - edit service type page loads with expected layout
    Given I go to the "client - edit service type" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit service type - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Select your service type"

  Scenario: Client - edit service type page validates the service type
    Given I go to the "client - edit service type" page
    And the page has finished loading
    And I click the "Confirm" button
    Then the error message: "Service type is required" shows
    And I check the radio button: "Mandatory"
    And I click the "Confirm" button
    Then I am taken to the "client" page
