import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { shallow } from "enzyme";

import { BlmColorPicker } from "shared";
//import { BlmMediaPicker } from "components/shared";
import BlmPageBackgroundProps from "./BlmPageBackgroundProps";

const feature = loadFeature("./page-background.feature");

function setup() {
  const wrapper = shallow(<BlmPageBackgroundProps />);

  return { wrapper };
}

defineFeature(feature, (test) => {
  const { wrapper } = setup();

  test("Display background properties component", ({ given, then }) => {
    given("Create background properties component", () => {});
    then("Background component with its data", () => {
      //expect(wrapper.find(BlmMediaPicker).length).toBe(1);
      // expect(wrapper.find(BlmColorPicker).length).toBe(1);
      // expect(wrapper.find(CheckboxFormControlLabel).length).toBe(1);
      // expect(wrapper.find(RadioFormControlLabel).length).toBe(2);
    });
  });
});
