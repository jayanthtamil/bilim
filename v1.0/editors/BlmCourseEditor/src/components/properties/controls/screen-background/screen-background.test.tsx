import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { shallow } from "enzyme";

import { CourseElementProps } from "types";
import { ElementType } from "editor-constants";
import { BlmColorPicker } from "shared";
import { BlmMediaPicker } from "components/shared";
import BlmScreenBackgroundProps, { CompProps } from "./BlmScreenBackgroundProps";

const feature = loadFeature("./screen-background.feature");

const data = new CourseElementProps("12", "Screen", ElementType.Screen);

function setup() {
  const props: CompProps = {
    data,
    onChange: jest.fn(),
  };

  const wrapper = shallow(<BlmScreenBackgroundProps {...props} />);

  return { wrapper };
}

defineFeature(feature, (test) => {
  const { wrapper } = setup();

  test("Display screen background component", ({ given, then }) => {
    given("Create screen background component", () => {});
    then("Screen background component with its data", () => {
      expect(wrapper.find(BlmColorPicker).length).toBe(1);
      expect(wrapper.find(BlmMediaPicker).length).toBe(2);
    });
  });
});
