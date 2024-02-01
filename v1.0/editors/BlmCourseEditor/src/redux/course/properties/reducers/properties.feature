Feature: Course properties reducer
    testing reducers for course properties
    
    Scenario: Initialize course properties
        When Should handle INITIALIZE_COURSE_PROPERTIES action
    
    Scenario: Get course properties started
        When Should handle GET_COURSE_PROPERTIES_STARTED action
    
    Scenario: Get course properties success 
        When Should handle GET_COURSE_PROPERTIES_SUCCESS action
    
    Scenario: Get course properties error
        When Should handle GET_COURSE_PROPERTIES_ERROR action