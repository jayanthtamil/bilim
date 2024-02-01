import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { shallow, ReactWrapper, ShallowWrapper } from "enzyme";

import BlmColorPicker from "./BlmColorPicker";

const feature = loadFeature("./color-picker.feature");

defineFeature(feature, (test) => {
  let wrapper: ShallowWrapper;

  test("Display color picker component", ({ given, then }) => {
    given("creating color picker component", () => {
      wrapper = shallow(<BlmColorPicker />);
    });

    then("the color picker component is displayed in response", () => {
      expect(wrapper.find(".color-picker").length).toBe(1);
    });
  });
});
