import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { ReactWrapper } from "enzyme";

import {
  CourseElement,
  CourseElementTemplate,
  AssociatedTemplate,
  ChapterEvaluationProps,
} from "types";
import { ElementType, StructureType } from "editor-constants";
import { actUpdateWrapper, mountWithStore } from "tests/utils";
import { BlmQuestionTemplateContainer } from "components/templates/containers";
import { BlmGeneralProps, BlmScreenBackgroundProps, BlmLogProps } from "../../properties";
import BlmQuestionElement, { CompProps } from "./BlmQuestionElement";

jest.mock("components/templates/containers", () => {
  const BlmQuestionTemplateContainer = () => <div />;

  return { BlmQuestionTemplateContainer };
});

const feature = loadFeature("./question.feature");
const question1 = new CourseElement("12", "Question 1", ElementType.Question);
const question2 = new CourseElement("13", "Question 2", ElementType.Question);
const chapter = new CourseElement<ChapterEvaluationProps>("34", "Chapter", ElementType.Chapter);
const tree = new CourseElement("324", "Structure", StructureType.Structure);
const templates = [
  new CourseElementTemplate(
    "23",
    "PartPage",
    ElementType.PartPage,
    "<html><html>",
    new AssociatedTemplate("123", "mo1", "light.jpg", "dark.jpg"),
    false
  ),
];

chapter.isevaluation = "true";
chapter.evalutionJSON = new ChapterEvaluationProps();
chapter.evalutionJSON.directEvaluation = true;
chapter.children = [question2];
tree.children = [chapter, question1];

function setup() {
  const props: CompProps = {
    element: question1,
    tree: tree,
    onClose: jest.fn(),
    selectTreeItem: jest.fn(),
    openStructurePanel: jest.fn(),
    setElementPropertiesTabIndex: jest.fn(),
    openDialog: jest.fn(),
  };

  const { wrapper } = mountWithStore(<BlmQuestionElement {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Display Question element with tabs and templates", ({ given, and, then }) => {
    given("Create Question component", () => {
      return actUpdateWrapper(wrapper);
    });

    then("Question tabs is displayed with given element", () => {
      simulateTabClick(wrapper, 0);
      expect(wrapper.find(BlmGeneralProps).props().data).toMatchObject(props.element);

      simulateTabClick(wrapper, 1);
      expect(wrapper.find(BlmScreenBackgroundProps)).toHaveLength(1);

      simulateTabClick(wrapper, 2);
      expect(wrapper.find(BlmLogProps).props().data).toMatchObject(props.element);
    });

    and("Question no theme warning is not displayed", () => {
      expect(props.openDialog).not.toHaveBeenCalled();
    });

    and("Question templates is displayed with given templates", () => {
      const templatesWrapper = wrapper.find(BlmQuestionTemplateContainer);
      const templateProps = templatesWrapper.props();

      expect(templatesWrapper).toHaveLength(1);
    });
  });

  test("Display Question no theme warning for evaluation element", ({ given, and, then }) => {
    given("Create Question component", () => {
      return actUpdateWrapper(wrapper);
    });

    then("Evaluation element with no theme is changed", () => {
      props.element = question2;
      wrapper.setProps(props);
      return actUpdateWrapper(wrapper);
    });

    and("Question no theme warning is displayed", () => {
      expect(props.openDialog).toHaveBeenCalled();
    });
  });
});

function simulateTabClick(wrapper: ReactWrapper, index: number = 0) {
  const tab = wrapper.find(".question-tab-wrapper button.MuiTab-root").at(index);

  tab.simulate("click");
}
