Feature: Media Picker component
    This checks whether the preview of the uploaded media is displayed

    Scenario: Display preview of the uploaded media
        Given Create Media Picker component
        When Browse button is displayed and File is selected
        Then The file is uploaded to the store
        And After file is uploaded media removed from the store
        And Preview of the uploaded media is displayed in response