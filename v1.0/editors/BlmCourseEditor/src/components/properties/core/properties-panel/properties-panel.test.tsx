import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { ReactWrapper } from "enzyme";
import { Popper } from "@material-ui/core";

import { CourseElement, CourseElementProps } from "types";
import { ElementType } from "editor-constants";
import { mountWithStore } from "tests/utils";
import BlmChapterElement from "../controls/chapter";
import BlmCustomElement from "../controls/custom";
import BlmPropertiesPanel, { CompProps } from "./BlmPropertiesPanel";

const feature = loadFeature("./properties-panel.feature");

const chapter = new CourseElement("12", "Chapter", ElementType.Chapter);
const chapterProps = new CourseElementProps(chapter.id, chapter.name, chapter.type);
const custom = new CourseElement("13", "Custom", ElementType.Custom);
const customProps = new CourseElementProps(custom.id, custom.name, custom.type);
const anchor = document.createElement("div");

function setup() {
  const props: CompProps = {
    element: undefined,
    properties: undefined,
    open: false,
    anchorEle: undefined,
    selectTreeItem: jest.fn(),
    getElementProperties: jest.fn(),
    setElementPropertiesTabIndex: jest.fn(),
    updateElementProperties: jest.fn(),
    updateTreeEvaluation: jest.fn(),
  };

  const { wrapper } = mountWithStore<CompProps>(<BlmPropertiesPanel {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { wrapper, props } = setup();

  test("Display Properties panel component without childern", ({ given, when, then }) => {
    given("Create Properties panel component", () => {});
    when("No element is selected", () => {});
    then("No childern should be rendered", () => {
      assertHasChild(wrapper, BlmChapterElement);
      assertHasChild(wrapper, BlmCustomElement);
    });
  });

  test("Display Properties panel component with chapter", ({ given, when, then }) => {
    given("Create Properties panel component", () => {});
    when("Chapter element is selected", () => {
      props.element = chapter;
      props.properties = chapterProps;
      props.open = true;
      props.anchorEle = anchor;

      wrapper.setProps(props);
      wrapper.update();
    });
    then("Chapter component should be rendered with element", () => {
      assertHasChild(wrapper, BlmChapterElement, chapter);
      assertHasChild(wrapper, BlmCustomElement);
    });
  });

  test("Display Properties panel component with custom", ({ given, when, then }) => {
    given("Create Properties panel component", () => {});
    when("Custom element is selected", () => {
      props.element = custom;
      props.properties = customProps;
      props.open = true;
      props.anchorEle = anchor;

      wrapper.setProps(props);
      wrapper.update();
    });
    then("Custom component should be rendered with element", () => {
      assertHasChild(wrapper, BlmChapterElement);
      assertHasChild(wrapper, BlmCustomElement, customProps);
    });
  });

  test("Properties panel should be closed", ({ given, when, then }) => {
    given("Create Properties panel component", () => {});
    when("Close button is clicked", () => {
      simulateCloseClick(wrapper);
    });
  });

  test("Popper panel should controled by open prop", ({ given, when, then }) => {
    given("Create Properties panel component", () => {});
    when("open prop is true", () => {
      props.open = true;
      wrapper.setProps(props);
      wrapper.update();
    });
    then("Popper panel should be opened", () => {
      assertPopperIsOpened(wrapper, props.open, props.anchorEle);
    });
    when("open prop is false", () => {
      props.open = false;
      wrapper.setProps(props);
      wrapper.update();
    });
    then("Popper panel should be closed", () => {
      assertPopperIsOpened(wrapper, props.open);
    });
  });
});

function assertHasChild<T>(wrapper: ReactWrapper<CompProps>, component: T, data?: CourseElement) {
  const child = wrapper.find(component);

  if (data) {
    const props = child.props();

    expect(props.data).toMatchObject(data);
    expect(child).toHaveLength(1);
  } else {
    expect(child).toHaveLength(0);
  }
}

function simulateCloseClick(wrapper: ReactWrapper<CompProps>) {
  const closeBtn = wrapper.find(".props-panel-close-btn");
  closeBtn.simulate("click");
}

function assertPopperIsOpened(
  wrapper: ReactWrapper<CompProps>,
  open: boolean,
  anchorEle?: HTMLElement
) {
  const popper = wrapper.find(Popper);
  const props = popper.props();

  expect(props.open).toBe(open);

  if (open) {
    expect(props.anchorEl).toBe(anchorEle);
  } else {
    expect(props.anchorEl).toBeNull();
  }
}
