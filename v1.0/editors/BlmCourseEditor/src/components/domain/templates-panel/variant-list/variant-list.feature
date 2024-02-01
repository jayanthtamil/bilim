Feature: Variant List
    This check variant list is displayed properly

    Scenario: Varaint list is displayed
        Given Variant list component
        When Data is changed
        Then Template name is displayed
        And Background light is selected
        And Main and variant list is displayed
    
    Scenario: Check background switch button is working
        Given Variant list component
        And Background and Varaint list is light
        When Background switched to dark
        Then Background and Varaint list is dark
    
    Scenario: Check item click handler is called
        Given Variant list component
        When Item is clicked
        Then Item click handler is called
        And Item is selected

    Scenario: Close handler is called after close button is clicked
        Given Variant list component
        When Close button is clicked
        And Close handler is called

