Feature: Repository panel
  This checks the repository panel functionality

  Scenario: Display Repository panel without data
    Given Repository panel component
    When Data is not given
    Then Accordion and ContextMenu should not be displayed

  Scenario: Display Repository panel with data
    Given Repository panel component
    When Data is given
    Then Accordion and ContextMenu should be displayed with data

  Scenario: Display Repository panel with Context menu
    Given Repository panel component
    When Options icon is clicked in Accordion panel
    Then ContextMenu panel should be displayed with data

