import React from "react";
import { ReactWrapper } from "enzyme";
import { defineFeature, loadFeature } from "jest-cucumber";

import { CourseElement, CourseElementProps } from "types";
import { ElementType } from "editor-constants";
import { actUpdateWrapper, mountWithStore } from "tests/utils";
import {
  BlmGeneralProps,
  BlmCompletionProps,
  BlmChapterEvaluationProps,
  BlmLogProps,
} from "../../properties";
import BlmChapterElement, { CompProps } from "./BlmChapterElement";

const feature = loadFeature("./chapter.feature");

const chapter = new CourseElement("12", "Chapter", ElementType.Chapter);
const chapterProps = new CourseElementProps(chapter.id, chapter.name, chapter.type);
const evalution = new CourseElement("13", "Evalution", ElementType.Chapter);
const evalutionProps = new CourseElementProps(evalution.id, evalution.name, evalution.type);
evalution.isevaluation = evalutionProps.isevaluation = "true";

function setup() {
  const props: CompProps = {
    element: chapter,
    data: chapterProps,
    tabIndex: 0,
    onChange: jest.fn(),
    handleTabChangeOrValidateTheme: jest.fn(),
  };

  const { wrapper } = mountWithStore(<BlmChapterElement {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Display Chapter element with tabs", ({ given, then }) => {
    given("Create Chapter component", () => {
      return actUpdateWrapper(wrapper);
    });

    then("Chapter tabs is displayed with given data", () => {
      expect(wrapper.find(BlmGeneralProps).props().data).toMatchObject(props.data);

      simulateTabClick(wrapper, 1);
      expect(wrapper.find(BlmCompletionProps).props().data).toMatchObject(props.data);

      simulateTabClick(wrapper, 2);
      const evalutionProps = wrapper.find(BlmChapterEvaluationProps).props();
      expect(evalutionProps.element).toMatchObject(props.element);
      expect(evalutionProps.data).toMatchObject(props.data);

      simulateTabClick(wrapper, 3);
      expect(wrapper.find(BlmLogProps).props().data).toMatchObject(props.data);
    });
  });

  test("Display Evaluation tab for evaluation element", ({ given, then }) => {
    given("Create Chapter component", () => {
      props.element = evalution;
      props.data = evalutionProps;
      wrapper.setProps(props);

      return actUpdateWrapper(wrapper);
    });

    then("Evaluation tab is selected", () => {
      testTabPanelVisible(wrapper, 2);
    });
  });
});

function simulateTabClick(wrapper: ReactWrapper, index: number = 0) {
  const tab = wrapper.find(".MuiTabs-root button.MuiTab-root").at(index);

  tab.simulate("click");
}

function testTabPanelVisible(wrapper: ReactWrapper, index: number = 0) {
  //const tabPanel = wrapper.find(TabPanel).at(index);
  //expect(tabPanel.props().selected).toBe(true);
}
