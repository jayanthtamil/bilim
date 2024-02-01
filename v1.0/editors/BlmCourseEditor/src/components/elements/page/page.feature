Feature: Page Element
    This checks whether the page element is displayed

    Scenario: Display Page element with tabs and templates
        Given Create page component
        Then Page tabs is displayed with given element
        And Page templates is displayed with given templates