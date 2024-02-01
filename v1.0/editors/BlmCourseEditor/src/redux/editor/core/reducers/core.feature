Feature: Element properties reducer
    Testing reducers for element properties
    
    Scenario: Editor structures reducer
        When Should handle SELECT_TREE_ITEM action
        When Should handle SET_STRUCTURES_ANCHOR_ELE action
        When Should handle TOGGLE_STRUCTURES_PANEL action
        When Should handle CLICK_RENAME_ACTION action
        When Should handle CLICK_ADD_ACTION action

    Scenario: Element properties reducer
        When Should set anchor element on properties panel
        When Should toggle element properties panel
        When Should handle element properties tab index action
        When Should handle click evaluation action
