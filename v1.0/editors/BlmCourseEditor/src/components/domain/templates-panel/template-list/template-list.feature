Feature: Template List
    This check template list is displayed properly

    Scenario: Template list is displayed with info icon
        Given Template list component
        When Category is changed
        Then Category name is displayed
        And Info icon is displayed
        And Warning message is displayed
        And Template list items are displayed
    
    Scenario: Template list is displyaed without info icon
        Given Template list component
        When Category is changed
        Then Category name is displayed
        And Info icon is not displayed
        And Warning message is displayed
        And Template list items are displayed
    
    Scenario: Template list is displayed with Tab Category only
        Given Template list component
        When Category is changed
        And Warning message is not displayed
        And Tabs are displayed
        And Template list items are displayed

    Scenario: Template list is displayed with Group Category only
        Given Template list component
        When Category is changed
        And Warning message is displayed
        And Groups are displayed
        And Template list items are displayed

    Scenario: Template list is displayed with Tab and Group Category
        Given Template list component
        When Category is changed
        And Warning message is not displayed
        And Tabs are displayed
        And Groups are displayed
        And Template list items are displayed

    Scenario: Show variant list when list item variant button is clicked
        Given Template list component
        And Category is changed
        And Variant list is not displayed
        When Template item variant button is clicked
        And Variant list is displayed
    
    Scenario: Close Template panel when list item add button is clicked
        Given Template list component
        When Template item add button is clicked
        And Varaint list is closed

    Scenario: Close Template panel when close button is clicked
        Given Template list component
        When Close button is clicked
        And Template panel is closed

    Scenario: Show popover panel when info btn is clicked
        Given Template list component
        When Info button is clicked
        And Popover panel is displayed