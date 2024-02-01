Feature: Screen Element
    This checks whether the Screen element is displayed

    Scenario: Display Screen element with tabs and templates
        Given Create Screen component
        Then Screen tabs is displayed with given element
        And Screen templates is displayed with given templates