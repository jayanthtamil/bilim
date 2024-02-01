Feature: Domain reducer
    Testing reducers for domains
    
    Scenario: Domain reducer for templates and themes
        When Should handle all api start actions
        When Should handle GET_THEMES_SUCCESS action
        When Should handle GET_TEMPLATES_SUCCESS action
        When Should handle all api error actions
