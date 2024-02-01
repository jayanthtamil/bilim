Feature: Chapter Element
    This checks whether the Chapter element is displayed

    Scenario: Display Chapter element with tabs 
        Given Create Chapter component
        Then Chapter tabs is displayed with given data

    Scenario: Display Evaluation tab for evaluation element
        Given Create Chapter component
        Then Evaluation tab is selected