import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { ReactWrapper } from "enzyme";

import { CourseElement, PageEvaluationProps } from "types";
import { ElementType } from "editor-constants";
import { actUpdateWrapper, mountWithStore } from "tests/utils";
import { BlmPageTemplateContainer } from "components/templates/containers";
import {
  BlmGeneralProps,
  BlmCompletionProps,
  BlmBackgroundProps,
  BlmChapterEvaluationProps,
  BlmLogProps,
} from "../../properties";
import BlmPageElement, { CompProps } from "./BlmPageElement";

jest.mock("components/templates/containers", () => {
  const BlmPageTemplateContainer = () => <div />;

  return { BlmPageTemplateContainer };
});

const feature = loadFeature("./page.feature");

const element = new CourseElement<PageEvaluationProps>("12", "Page", ElementType.Page);

function setup() {
  const props: CompProps = {
    element,
  };
  const { store, wrapper } = mountWithStore(<BlmPageElement {...props} />);

  return {
    store,
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Display Page element with tabs and templates", ({ given, and, then }) => {
    given("Create page component", () => {
      return actUpdateWrapper(wrapper);
    });

    then("Page tabs is displayed with given element", () => {
      simulateTabClick(wrapper, 0);
      expect(wrapper.find(BlmGeneralProps).props().data).toMatchObject(props.element);

      simulateTabClick(wrapper, 1);
      expect(wrapper.find(BlmCompletionProps).props().data).toMatchObject(props.element);

      simulateTabClick(wrapper, 2);
      expect(wrapper.find(BlmPageBackgroundProps)).toHaveLength(1);

      simulateTabClick(wrapper, 3);
      expect(wrapper.find(BlmChapterEvaluationProps).props().data).toMatchObject(props.element);

      simulateTabClick(wrapper, 4);
      expect(wrapper.find(BlmLogProps).props().data).toMatchObject(props.element);
    });

    and("Page templates is displayed with given templates", () => {
      const templatesWrapper = wrapper.find(BlmPageTemplateContainer);

      expect(templatesWrapper).toHaveLength(1);
    });
  });
});

function simulateTabClick(wrapper: ReactWrapper, index: number = 0) {
  const tab = wrapper.find(".page-tab-wrapper button.MuiTab-root").at(index);

  tab.simulate("click");
}
