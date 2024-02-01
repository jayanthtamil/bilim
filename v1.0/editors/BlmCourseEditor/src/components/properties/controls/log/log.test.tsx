import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { defineFeature, loadFeature } from "jest-cucumber";

import { CourseElementProps } from "types";
import { ElementType } from "editor-constants";
import { formatDate } from "utils/date-utils";
import BlmLogProps from "./BlmLogProps";

const feature = loadFeature("./log.feature");

const data = new CourseElementProps("12", "Chapter", ElementType.Chapter);
data.created = "2020-08-28 07:47:45";
data.modified = "2020-08-28 07:47:45";

function setup() {
  const props = {
    data,
  };

  const wrapper = shallow(<BlmLogProps {...props} />);

  return { wrapper, props };
}

defineFeature(feature, (test) => {
  const { wrapper, props } = setup();

  test("Display logs information", ({ given, then }) => {
    given("Create Log component", () => {});
    then("Display course element creation and modification information", () => {
      assertLabel(wrapper, "created-date", formatDate(props.data.created));
      assertLabel(wrapper, "modified-date", formatDate(props.data.modified));
      assertLabel(wrapper, "created-name", "JimmyD");
      assertLabel(wrapper, "modified-name", "JimmyD");
    });
  });
});

function assertLabel(wrapper: ShallowWrapper, testid: string, text: string) {
  expect(wrapper.find(`[data-testid="${testid}"]`).text()).toEqual(text);
}
