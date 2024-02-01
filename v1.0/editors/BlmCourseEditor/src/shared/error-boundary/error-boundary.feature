Feature: Error Boundary
  To handle the expections in the editor components

  Scenario: ErrorBoundary Mount - positive flow
    Given Initial state value defined false
    When Calling getDerivedStateFromError() to change state value
    Then Response render to display error content

  Scenario: ErrorBoundary Mount - negative flow
    Given Initial state value defined
    When Calling render function
    Then Verifying the render component props value