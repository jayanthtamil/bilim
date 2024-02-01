Feature: Template List Item
    This check template list item is displayed properly

    Scenario: Template list item is displayed 
        Given Template list item 
        When data is changed
        Then Order and Image is displayed
        And Info, Warning buttons aren't displayed

    Scenario: Template list item is displayed with Info and Warning button
        Given Template list item 
        When data is changed
        Then Order and Image is displayed
        And Info, Warning buttons are displayed

    Scenario: Template list buttons are worked
        Given Template list item
        When info, warning, add and variant buttons are clicked
        Then Buttons handlers are called

    Scenario: Template list item is selected
        Given Template list item
        And Template item is not selected
        When Template context selectedItem is changed
        Then Template item is selected
