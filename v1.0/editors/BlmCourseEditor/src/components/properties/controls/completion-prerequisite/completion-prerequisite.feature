Feature: Completion properties component
    This checks whether the Completion properties component is displayed

    Scenario: Display Completion properties without options
        Given Create Completion component
        When Custom completeness checkbox is not selected
        Then No options is displayed

    Scenario: Display Completion properties with options
        Given Create Completion component
        When Custom completeness checkbox is selected
        Then Options is displayed

    Scenario: Display Completion properties with action options
        Given Create Completion component
        When Custom completeness by action is not selected
        Then Action Options is not displayed
        When Custom completeness by action is selected
        Then Action Options is displayed

    Scenario: Display Completion properties with action timer option
        Given Create Completion component
        When Custom completeness by action timer is not selected
        Then Timer text input is not displayed
        When Custom completeness by action timer is selected
        Then Timer text input is displayed

    Scenario: Completion properties should be saved
        Given Create Completion component
        When Completion options are edited
        Then All edited options are saved