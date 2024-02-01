Feature: Question Element
    This checks whether the Question element is displayed

    Scenario: Display Question element with tabs and templates
        Given Create Question component
        Then Question tabs is displayed with given element
        And Question no theme warning is not displayed 
        And Question templates is displayed with given templates

    Scenario: Display Question no theme warning for evaluation element
        Given Create Question component
        When Evaluation element with no theme is changed
        And Question no theme warning is displayed 