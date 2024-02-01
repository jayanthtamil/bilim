Feature: Variant List Item
    This check template list item is displayed properly

    Scenario: Variant list item is displayed 
        Given Variant list item 
        When data is changed
        Then Light image is displayed

    Scenario: Variant list item is displayed for background light and dark
        Given Variant list item
        And Light image is displayed
        When Background dark is selected
        Then Dark image is displayed

    Scenario: Variant list item is selected
        Given Variant list item
        And Variant item is not highlighted
        When Variant item is selected
        Then Variant item is highlighted

    Scenario: Check variant item click handler are called
        Given Varian list item
        When Variant lit item is clicked
        Then Item click handler is called
