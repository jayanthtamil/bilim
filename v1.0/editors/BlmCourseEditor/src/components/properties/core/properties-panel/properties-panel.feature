Feature: Properties panel component
    This checks whether the Editor Board component is displayed with its functionality

    Scenario: Display Properties panel component without childern
        Given Create Properties panel component
        When No element is selected
        Then No childern should be rendered

    Scenario: Display Properties panel component with chapter
        Given Create Properties panel component
        When Chapter element is selected
        Then Chapter component should be rendered with element

    Scenario: Display Properties panel component with custom
        Given Create Properties panel component
        When Custom element is selected
        Then Custom component should be rendered with element

    Scenario: Properties panel should be closed
        Given Create Properties panel component
        When Close button is clicked
        Then Properties panel should be closed

    Scenario: Popper panel should controled by open prop
        Given Create Properties panel component
        When open prop is true
        Then Popper panel should be opened
        When open prop is false
        Then Popper panel should be closed