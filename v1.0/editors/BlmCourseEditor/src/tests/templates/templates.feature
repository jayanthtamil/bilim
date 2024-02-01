
Feature: Templates test cases
    Check template test cases are runing successfully
    
    Scenario: As a user, I want to assign a template to a screen
		Given Screen is created under the course structure and display in the treeview
		And The screen does not have a template yet
		When I click edit screen
		Then The list of template categories is displayed at the left panel
		And All template under the categories should have scope=screen
		And None of these templates should have other scope than screen
		And Template categories cannot be empty
		And The categories at the left panel should have the field menu=left

    Scenario: As a user, I want to create a partpage
		Given A page is created under the course structure and display in the editor
		When I click add partpage in the page (button + between 2 partpage)
        And I select Content in the menu
        Then The list of template categories is displayed at the left panel
		And All template under the categories should have scope=partpage
        And None of these templates should have another scope than partpage
        And Template categories cannot be empty
        And The categories at the left panel should have the field menu=left
        And Templates context value doesn’t matter
    
    Scenario: As a user, I want to assign a template to a question
		Given The question is created under the course structure and display in the treeview
		And The question does not have a template yet
		When I click edit question
		Then The list of template categories is displayed at the left panel
		And All template under the categories should have scope=question
		And None of these templates should have other scope than question
		And Template categories cannot be empty
		And The categories at the left panel should have the field menu=left
		And Templates context value doesn’t matter  
    
    Scenario: As a user, I want to create a partpage question
		Given A page is created under the course structure and display in the editor
		When I click add partpage in the page (button + between 2 partpage)
		And I select Question in the menu
		Then The list of template categories is displayed at the left panel
		And All template under the categories should have scope=question
		And None of these templates should have other scope than question
		And All template under the categories should have context=page
		And None of these templates should have another context than page
		And Template categories cannot be empty
		And The categories at the left panel should have the field menu=left

    Scenario: As a user, I want to create a simple content under screen
        Given The simple content is created under a screen and display in the editor
        And The simple content does not have a template yet
        And The screen parent doesn’t have any interaction
        When I click edit simple content
        Then The list of template categories is displayed at the left panel
        And All template under the categories should have scope=simple content
        And None of these templates should have other scope than simple content
        And All template under the categories should have context=screen
        And None of these templates should have another context than screen
        And Template categories cannot be empty
        And The categories at the left panel should have the field menu=left
         
    Scenario: As a user, I want to create a simple content under partpage
		Given The simple content is created under a partpage and display in the editor
		And The simple content does not have a template yet
		And The partpage parent doesn’t have any interaction
		When I click edit simple content
		Then The list of template categories is displayed at the left panel
		And All template under the categories should have scope=simple content
		And None of these templates should have other scope than simple content
		And All template under the categories should have context=partpage
		And None of these templates should have another context than partpage
		And Template categories cannot be empty
		And The categories at the left panel should have the field menu=left

    Scenario: As a user, I want to create a simple content under question
		Given The simple content is created under a question and display in the editor
		And The simple content does not have a template yet
		When I click edit simple content
		Then The list of template categories is displayed at the left panel
		And All template under the categories should have scope=simple content
		And None of these templates should have other scope than simple content
		And All template under the categories should have context=question
		And None of these templates should have another context than question
		And Template categories cannot be empty
		And The categories at the left panel should have the field menu=left