import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { ReactWrapper } from "enzyme";

import { CourseElement } from "types";
import { ElementType } from "editor-constants";
import { actUpdateWrapper, mountWithStore } from "tests/utils";
import { BlmScreenTemplateContainer } from "components/templates/containers";
import {
  BlmGeneralProps,
  BlmCompletionProps,
  BlmScreenBackgroundProps,
  BlmLogProps,
} from "../../properties";
import BlmScreenElement, { CompProps } from "./BlmScreenElement";

jest.mock("components/templates/containers", () => {
  const BlmScreenTemplateContainer = () => <div />;

  return { BlmScreenTemplateContainer };
});

const feature = loadFeature("./screen.feature");

const element = new CourseElement("12", "Screen", ElementType.Screen);

function setup() {
  const props: CompProps = {
    element,
  };

  const { wrapper } = mountWithStore(<BlmScreenElement {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Display Screen element with tabs and templates", ({ given, and, then }) => {
    given("Create Screen component", () => {
      return actUpdateWrapper(wrapper);
    });

    then("Screen tabs is displayed with given element", () => {
      simulateTabClick(wrapper, 0);
      expect(wrapper.find(BlmGeneralProps).props().data).toMatchObject(props.element);

      simulateTabClick(wrapper, 1);
      expect(wrapper.find(BlmCompletionProps).props().data).toMatchObject(props.element);

      simulateTabClick(wrapper, 2);
      expect(wrapper.find(BlmScreenBackgroundProps)).toHaveLength(1);

      simulateTabClick(wrapper, 3);
      expect(wrapper.find(BlmLogProps).props().data).toMatchObject(props.element);
    });

    and("Screen templates is displayed with given templates", () => {
      const templatesWrapper = wrapper.find(BlmScreenTemplateContainer);

      expect(templatesWrapper).toHaveLength(1);
    });
  });
});

function simulateTabClick(wrapper: ReactWrapper, index: number = 0) {
  const tab = wrapper.find(".screen-tab-wrapper button.MuiTab-root").at(index);

  tab.simulate("click");
}
