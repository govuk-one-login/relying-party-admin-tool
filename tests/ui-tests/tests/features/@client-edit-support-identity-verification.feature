Feature: Client - edit support identity verification page

  Scenario: Client - edit support identity verification page loads with expected layout
    Given I go to the "client - edit support identity verification" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit support identity verification - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Is your client using identity verification?"
    And the page contains the text: "This will require: claims your client requires required levels of confidence landing page url"
    And the page contains the text: "This can be added/changed after your client is created. This cannot be used injuction with client secret."

  Scenario: Client - edit support identity verification page validates the support identity verification
    Given I go to the "client - edit support identity verification" page
    And the page has finished loading
    And I click the "Confirm" button
    Then the error message: "Choose an option to support identity verification or not" shows
    And I check the radio button: "No"
    And I click the "Confirm" button
    Then I am taken to the "client" page
