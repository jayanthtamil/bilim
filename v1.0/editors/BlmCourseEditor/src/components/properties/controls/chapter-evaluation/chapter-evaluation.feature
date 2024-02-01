Feature: Evaluation properties
    This checks whether the evalaution properties are displayed

    Scenario: evalaution tab automatically selected on clicking an evaluation item
        When An evaluation element is selected in treeview
        Then The evaluation tab is selected automatically in properties panel
        
    Scenario: As a user, I want to define a chapter as evaluation without previous data
        Given A chapter is selected
        And The evaluation tab is selected
        And no evaluation option is defined
        And There are no previous stored evaluation data for this chapter
        And The chapter has already children elements
        When I select evaluation in the dropdown
        Then The theme is automatically defined as no_theme
		And The evaluation options are displayed per default values
		And A feedback element is added as last children of the selected chapter
		And Display question mark icon in treeview at the right of the chapter 

    Scenario: As a user, I want to define a chapter as evaluation with previous data and feedback not present
        Given A chapter is selected
        And The evaluation tab is selected
        And no evaluation option is defined
        And There are previous stored evaluation data for this chapter
        And Evaluation feedback is defined as NOT selected in the previous data
		And The chapter has already children elements
        When I select evaluation in the dropdown
        Then The theme is automatically defined as no_theme, whatever it was defined in the previous stored evaluation data
		And The evaluation options are displayed as per the previous values
		And A feedback element is NOT added as last children of the selected chapter
		And Display question mark icon in treeview at the right of the chapter 

    Scenario: As a user, I want to define a chapter as evaluation with previous data and feedback present
        Given A chapter is selected
        And The evaluation tab is selected
        And no evaluation option is defined
        And There are previous stored evaluation data for this chapter
        And Evaluation feedback is defined as selected in the previous data
		And The chapter has already children elements
        When I select evaluation in the dropdown
        Then The theme is automatically defined as no_theme, whatever it was defined in the previous stored evaluation data
		And The evaluation options are displayed as per the previous values
		And A feedback element is added as last children of the selected chapter
		And Display question mark icon in treeview at the right of the chapter 

    Scenario: As a user, I want to define a chapter as evaluation with no previous data and feedback not present and themes list
        Given A chapter is selected
        And The evaluation tab is selected
        And no evaluation option is defined
        And There are no previous stored evaluation data for this chapter
        And The chapter is empty
        When I select evaluation in the dropdown
        Then The list of theme is displayed
		And The evaluation options are NOT displayed 
		And A feedback element is NOT added as last children of the selected chapter
		And Display question mark icon in treeview at the right of the chapter 

    Scenario: As a user, I want to define a chapter as evaluation with previous data and feedback not present and themes list
        Given A chapter is selected
        And The evaluation tab is selected
        And no evaluation option is defined
        And There are previous stored evaluation data for this chapter
        And The chapter is empty
		And Evaluation feedback is defined as NOT selected in the previous data
        When I select evaluation in the dropdown
        Then The theme is defined as per the previous data
		And The evaluation options are displayed as per the previous values 
		And A feedback element is NOT added as last children of the selected chapter
		And Display question mark icon in treeview at the right of the chapter 
		
    Scenario: As a user, I want to define a chapter as evaluation with previous data and feedback present and themes list
        Given A chapter is selected
        And The evaluation tab is selected
        And no evaluation option is defined
        And There are previous stored evaluation data for this chapter
        And The chapter is empty
		And Evaluation feedback is defined as selected in the previous data
        When I select evaluation in the dropdown
        Then The theme is defined as per the previous data
		And The evaluation options are displayed as per the previous values 
		And A feedback element is added as last children of the selected chapter
		And Display question mark icon in treeview at the right of the chapter 
