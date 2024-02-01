import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { shallow, ShallowWrapper } from "enzyme";

import { CourseElement } from "types";
import { ElementType } from "editor-constants";
import BlmScreenElement from "../controls/screen";
import BlmPageElement from "../controls/page";
import BlmQuestionElement from "../controls/question";
import BlmEditorBoard, { CompProps } from "./BlmEditorBoard";

const feature = loadFeature("./editor-board.feature");

const screen = new CourseElement("12", "Screen", ElementType.Screen);
const page = new CourseElement("13", "Page", ElementType.Page);
const question = new CourseElement("14", "Question", ElementType.Question);

function setup() {
  const props: CompProps = {
    element: undefined,
    structure: undefined,
    closeElementTemplatesPanel: jest.fn(),
  };

  const wrapper = shallow(<BlmEditorBoard {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { wrapper, props } = setup();

  test("Display Editor Board component without childern", ({ given, when, then }) => {
    given("Create Editor component", () => {});
    when("No element is selected", () => {});
    then("No childern should be rendered", () => {
      assertHasChild(wrapper, BlmScreenElement);
      assertHasChild(wrapper, BlmPageElement);
      assertHasChild(wrapper, BlmQuestionElement);
    });
  });

  test("Display Editor Board component with screen", ({ given, when, then }) => {
    given("Create Editor component", () => {});
    when("Screen element is selected", () => {
      props.element = screen;
      wrapper.setProps(props);
    });
    then("Screen component should be rendered with element", () => {
      assertHasChild(wrapper, BlmScreenElement, screen);
      assertHasChild(wrapper, BlmPageElement);
      assertHasChild(wrapper, BlmQuestionElement);
    });
  });

  test("Display Editor Board component with page", ({ given, when, then }) => {
    given("Create Editor component", () => {});
    when("Page element is selected", () => {
      props.element = page;
      wrapper.setProps(props);
    });
    then("Page component should be rendered with element", () => {
      assertHasChild(wrapper, BlmScreenElement);
      assertHasChild(wrapper, BlmPageElement, page);
      assertHasChild(wrapper, BlmQuestionElement);
    });
  });

  test("Display Editor Board component with question", ({ given, when, then }) => {
    given("Create Editor component", () => {});
    when("Question element is selected", () => {
      props.element = question;
      wrapper.setProps(props);
    });
    then("Question component should be rendered with element", () => {
      assertHasChild(wrapper, BlmScreenElement);
      assertHasChild(wrapper, BlmPageElement);
      assertHasChild(wrapper, BlmQuestionElement, question);
    });
  });
});

function assertHasChild<T>(wrapper: ShallowWrapper, component: T, element?: CourseElement) {
  const child = wrapper.find(component);

  if (element) {
    const props = child.props();

    expect(props.element).toBe(element);
    expect(child).toHaveLength(1);
  } else {
    expect(child).toHaveLength(0);
  }
}
