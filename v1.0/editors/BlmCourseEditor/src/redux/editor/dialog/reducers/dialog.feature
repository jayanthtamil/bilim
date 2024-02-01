Feature: Dialogs reducer
    Testing open and close dialogs
    
    Scenario: Dialogs reducer
        When Should handle OPEN_DIALOG action
        When should handle OPEN_CONFIRM_DIALOG action
        When Should hanlde CLOSE_DIALOG action
