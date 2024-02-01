Feature: Category List Item
    This check category list item is displayed properly

    Scenario: Category list item is displayed for category without sub category list
        Given Category list item
        When Data is changed
        Then Item is displayed wtihout sub category list

    Scenario: Category list item is displayed for category with sub category list
        Given Category list item
        When Data is changed
        Then Item is displayed with sub category list
        And Toggle sub category list
    
    Scenario: Category list item is selected
        Given Category list item
        When Context selectedCategory is changed
        Then Item is selected

    Scenario: Category list item click is worked
        Given Category list item
        When Item is clicked
        Then Item click handler is called




