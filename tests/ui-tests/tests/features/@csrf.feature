Feature: CSRF protection

  Scenario: Submitting a form with an invalid CSRF token
    Given I go to the "create service" page
    And the page has finished loading
    Then I enter "My service" into the field "What is the name of your service?"
    Given I tamper with the CSRF token and submit the form
    Then I am taken to the "403 error" page
    And the page title is "Forbidden - Admin Tool"

  Scenario: Submitting a form with no CSRF token
    Given I go to the "create service" page
    And the page has finished loading
    Then I enter "My service" into the field "What is the name of your service?"
    Given I remove the CSRF token and submit the form
    Then I am taken to the "403 error" page
    And the page has finished loading
    And the page title is "Forbidden - Admin Tool"
