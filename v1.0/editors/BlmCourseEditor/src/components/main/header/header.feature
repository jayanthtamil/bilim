Feature: Header
  This check header is displayed properly in editor

  Scenario: Initial rendering
    Given Header component
    When After first rendering
    Then Anchor element values were updated with header element
    And Structures panel is opened by default
    
  Scenario: Course name should be displayed
    Given Header component
    When After rendering is finished
    Then Course name should be displayed

  Scenario: Anchor label is changed by tree item
    Given Header component
    When User select item in a tree
    Then Anchor label should match item name 
    When User deselecct item in a tree
    Then Anchor label should match default label.

  Scenario: Should toogle structures panel when clicking
    Giveng Header component 
    When Clicking the component
    Then Structure panel should be closed
    And Header anchor icon should be changed to close
    When Clicking the component again
    Then Structure panel should be opened
    And Header anchor icon should be changed to open