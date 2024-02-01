Feature: Category List
    This check category list is displayed properly

    Scenario: Empty categories should not be shown
        Given Category list component
        When Categories is given
        Then Empty categories are not displayed

    Scenario: Categories are displayed as per order
        Given Category list component
        When Categories is given
        Then Categories are displayed as per oder

    Scenario: Template list is displayed after category is selected
        Given Category list component
        When Category is selected
        Then Template list is displayed

    Scenario: Category list is closed after close button is clicked
        Given Category list component
        And Category is selected
        And Template list is displayed
        When Close button is clicked
        Then Category list is closed
        And Template list is closed

    Scenario: All category is created from all category templates
        Given Category list component
        When Categories is given
        Then All category is created with all categroy templates