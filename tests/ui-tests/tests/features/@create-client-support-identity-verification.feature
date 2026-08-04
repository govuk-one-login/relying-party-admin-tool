Feature: Create a new client - support identity verification page

  Scenario: Create a new client - support identity verification page loads with expected layout
    Given I go to the "create client - support identity verification" page
    And the page has finished loading
    And the page meets our accessibility standards
    And the page title is "Select token authentication method - Admin Tool"
    And the header shows
    And the navigation bar shows
    And the footer shows
    And the page contains the breadcrumbs: "Your services, Service Name, Create a client"
    Then the page has the heading: "Is your client using identity verification?"
    And the page contains the text: "This will require: claims your client requires required levels of confidence landing page url"
    And the page contains the text: "This can be added/changed after your client is created. This cannot be used injuction with client secret."

  Scenario: Create a new client - support identity verification page validation
    Given I go to the "create client - support identity verification" page
    And the page has finished loading
    And I click the "Continue" button
    Then the page contains the text: "Choose an option to support identity verification or not"
    And I check the radio button: "Yes"
    And I click the "Continue" button
    Then I am taken to the "create client - select claims" page

  Scenario: Create a new client - support identity verification page validates against client secret
    Given I go to the "create client - select client authentication" page
    And the page has finished loading
    And I click the "Continue" button
    And I check the radio button: "Client secret"
    And I enter "client-secret" into the field "Client secret"
    And I click the "Continue" button
    Then I am taken to the "create client - enter redirect urls" page
    And the page has finished loading
    And I enter "http://url.com" into the field "Add a redirect URL"
    And I click the "Add" button
    And the page has finished loading
    And I click the "Continue" button
    Then I am taken to the "create client - select scopes" page
    And I click the "Continue" button
    Then I am taken to the "create client - support identity verification" page
    And I check the radio button: "Yes"
    And I click the "Continue" button
    Then the page contains the text: "Identity verification cannot be supported if client secret is used as authentication method"
    And I check the radio button: "No"
    And I click the "Continue" button
    Then I am taken to the "create client - summary" page
