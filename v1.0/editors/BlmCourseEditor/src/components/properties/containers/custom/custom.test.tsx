import React from "react";
import { ReactWrapper } from "enzyme";
import { defineFeature, loadFeature } from "jest-cucumber";

import { CourseElement, CourseElementProps } from "types";
import { ElementType } from "editor-constants";
import { actUpdateWrapper, mountWithStore } from "tests/utils";
import {
  BlmGeneralProps,
  BlmCustomEvaluationProps,
  BlmLogProps,
  BlmFilesProps,
} from "../../properties";
import BlmCustomElement, { CompProps } from "./BlmCustomElement";

const feature = loadFeature("./custom.feature");

const custom = new CourseElement("12", "Custom", ElementType.Custom);
const customProps = new CourseElementProps(custom.id, custom.name, custom.type);

function setup() {
  const props: CompProps = {
    data: customProps,
    onChange: jest.fn(),
  };

  const { wrapper } = mountWithStore(<BlmCustomElement {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Display Custom element with tabs", ({ given, then }) => {
    given("Create Custom component", () => {
      return actUpdateWrapper(wrapper);
    });

    then("Custom tabs is displayed with given data", () => {
      expect(wrapper.find(BlmGeneralProps).props().data).toMatchObject(props.data);

      simulateTabClick(wrapper, 1);
      expect(wrapper.find(BlmFilesProps)).toHaveLength(1);

      simulateTabClick(wrapper, 2);
      expect(wrapper.find(BlmCustomEvaluationProps).props().data).toMatchObject(props.data);

      simulateTabClick(wrapper, 3);
      expect(wrapper.find(BlmLogProps).props().data).toMatchObject(props.data);
    });
  });
});

function simulateTabClick(wrapper: ReactWrapper, index: number = 0) {
  const tab = wrapper.find(".MuiTabs-root button.MuiTab-root").at(index);

  tab.simulate("click");
}
