Feature: Client - edit Backchannel logout url page

  Scenario: Client - edit Backchannel logout url page loads with expected layout
    Given I go to the "client - edit backchannel logout url" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit backchannel logout URL - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Add a backchannel logout URL"

  Scenario: Client - edit Backchannel logout url page validates the Backchannel logout url
    Given I go to the "client - edit backchannel logout url" page
    And the page has finished loading
    And I enter "url.com" into the field "Add a backchannel logout URL"
    And I click the "Confirm" button
    Then the error message: "Your backchannel logout URL must be a valid URL" shows
    And I enter "http://url.com" into the field "Add a backchannel logout URL"
    And I click the "Confirm" button
    Then I am taken to the "client" page
