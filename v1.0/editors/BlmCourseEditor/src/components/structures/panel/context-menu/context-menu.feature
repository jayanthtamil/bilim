Feature: Context Menu
    This checks the Context menu functionality

    Scenario: Display Context Menu without Popover menu
        Given Context menu component
        When Data is not given
        Then Popover menu should not be displayed

    Scenario: Display Context Menu with Popover menu
        Given Context menu component
        When Data is given
        Then Popover menu should be displayed