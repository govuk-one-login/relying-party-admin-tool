Feature: Create a new client - edit support identity verification page

  Scenario: Create a new client - edit support identity verification page loads with expected layout
    Given I go to the "create client - edit support identity verification" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Edit support identity verification - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    Then the page has the heading: "Is your client using identity verification?"
    And the page contains the text: "This will require: claims your client requires required levels of confidence landing page url"
    And the page contains the text: "This can be added/changed after your client is created. This cannot be used injuction with client secret."

  Scenario: Create a new client - edit support identity verification page validation
    Given I go to the "create client - edit support identity verification" page
    And the page has finished loading
    And I click the "Continue" button
    Then the error message: "Choose an option to support identity verification or not" shows
    And I check the radio button: "No"
    And I click the "Continue" button
    Then I am taken to the "create client - summary" page
    And the field: "identity-verification-supported" has the value: "false"
    And I click the change button for: "identity verification supported" in the "Core fields" section on the summary page
    Then I am taken to the "create client - edit support identity verification" page
    And the radio: "No" is checked
    And I check the radio button: "Yes"
    And I click the "Continue" button
    Then I am taken to the "create client - select claims" page
