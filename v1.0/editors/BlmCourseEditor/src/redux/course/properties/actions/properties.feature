Feature: Course Properties action creators
    Testing action types for course properties
    
    Scenario: Initialize course properties
        When Should create INITIALIZE_COURSE_PROPERTIES action

    Scenario: Get course properties
        When Get course properties has been done
        Then Should create GET_COURSE_PROPERTIES_STARTED and GET_COURSE_PROPERTIES_SUCCESS actions 
        