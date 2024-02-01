Feature: Accordion component
    This checks whether the Accordion component is displayed

    Scenario: Display Accordion component with tree
        Given Accordion component
        Then Title should be displayed
        And Panel shoule be open
        And Tree should be displayed with given data
    
    Scenario: Display Accordion component with option icon
        Given Accordion component
        When ctxItem prop is changed
        And Option icon should be displayed
        And Option icon click handler should be assigned    