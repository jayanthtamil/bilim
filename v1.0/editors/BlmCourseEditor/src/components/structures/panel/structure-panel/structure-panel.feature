Feature: Structures panel 
  This checks the structures panel functionality

  Scenario: Display Structures panel without Popper
    Given Structure panel component
    When Data is not given
    Then Popper panel should not be displayed
  
  Scenario: Display Structures panel with Popper
    Given Structure panel component
    When Data is given
    Then Popper panel should be displayed

  Scenario: Popper panel should controled by props 
    Given Structure panel component
    When panel.open is true
    Then Popper panel should be opened
    When panel.open is false
    Then Popper panel should be closed

