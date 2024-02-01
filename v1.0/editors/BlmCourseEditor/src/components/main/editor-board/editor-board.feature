Feature: Editor Board component
    This checks whether the Editor Board component is displayed with its functionality

    Scenario: Display Editor Board component without childern
        Given Create Editor component
        When No element is selected
        Then No childern should be rendered

    Scenario: Display Editor Board component with screen
        Given Create Editor component
        When Screen element is selected
        Then Screen component should be rendered with element

    Scenario: Display Editor Board component with page
        Given Create Editor component
        When Page element is selected
        Then Page component should be rendered with element

    Scenario: Display Editor Board component with question
        Given Create Editor component
        When Question element is selected
        Then Question component should be rendered with element