import { defineFeature, loadFeature } from "jest-cucumber";
import React from "react";
import { shallow } from "enzyme";

import ErrorBoundary from "./BlmErrorBoundary";

const feature = loadFeature("./error-boundary.feature");

function setup() {
  const props = {
    error: jest.fn(),
  };

  const wrapper = shallow<ErrorBoundary>(<ErrorBoundary {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("ErrorBoundary Mount - positive flow", ({ given, when, then }) => {
    given("Initial state value defined false", () => {
      wrapper.setState({ hasError: false });
    });

    when("Calling getDerivedStateFromError() to change state value", () => {
      wrapper.setState({ hasError: true });
    });

    then("Response render to display error content", () => {
      expect(wrapper.instance().state.hasError).toBeTruthy();
      expect(wrapper.find("h1").exists()).toBeTruthy();
      expect(wrapper.text()).toBe("Something went wrong.");
    });
  });

  test("ErrorBoundary Mount - negative flow", ({ given, when, then }) => {
    given("Initial state value defined", () => {
      wrapper.setState({ hasError: false });
    });

    when("Calling render function", () => {});

    then("Verifying the render component props value", () => {
      expect(wrapper.instance().state.hasError).toBe(false);
      expect(wrapper.find("h1").exists()).toBe(false);
      expect(props.error).toBeTruthy();
    });
  });
});
