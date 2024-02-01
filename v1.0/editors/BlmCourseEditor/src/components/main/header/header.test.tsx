import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { mount, ReactWrapper } from "enzyme";

import { CourseElement } from "types";
import { ElementType, LOCALES } from "editor-constants";
import Header, { CompProps } from "./BlmHeader";

const feature = loadFeature("./header.feature");

function setup() {
  const props: CompProps = {
    panel: { isPinned: false, open: false, anchorEle: undefined },
    tree: { item: undefined },
    setStructureAnchorEle: jest.fn(),
    toggleStructurePanel: jest.fn(),
    togglePinUnpin: jest.fn(),
    setElementPropertiesAnchorEle: jest.fn(),
  };

  const wrapper = mount(<Header {...props} />);

  return {
    props,
    wrapper,
  };
}

const testAnchorLabel = (wrapper: ReactWrapper, name: string) => {
  const anchorEle = wrapper.find(".anchor-lbl");

  expect(anchorEle.text()).toBe(name);
};

const testAnchorIcon = (wrapper: ReactWrapper, isOpened: boolean) => {
  const icon = wrapper.find(".anchor-toggle-btn");

  expect(icon.hasClass("popper-opened")).toBe(isOpened);
};

const simulateAnchorClick = (wrapper: ReactWrapper) => {
  const anchorEle = wrapper.find(".structure-popper-anchor").first();

  anchorEle.simulate("click");
};

const toggleStruturesPanel = (wrapper: ReactWrapper, props: CompProps) => {
  props.panel.open = !props.panel.open;
  wrapper.setProps(props);
};

defineFeature(feature, (test) => {
  const { wrapper, props } = setup();
  const element = new CourseElement("12", "Test", ElementType.Screen);

  test("Initial rendering", ({ given, when, then, and }) => {
    given("Header component", () => {});
    when("After first rendering", () => {});
    then("Anchor element values were updated with header element", () => {
      const anchorEle = wrapper.find(".structure-popper-anchor").first().getDOMNode();

      expect(props.setElementPropertiesAnchorEle).toBeCalledWith(anchorEle);
      expect(props.setStructureAnchorEle).toBeCalledWith(anchorEle);
    });
    and("Structures panel is opened by default", () => {
      toggleStruturesPanel(wrapper, props);
      expect(props.toggleStructurePanel).toBeCalledWith(true);
      testAnchorIcon(wrapper, true);
    });
  });

  test("Course name should be displayed", ({ given, when, then }) => {
    given("Header component", () => {});
    when("After rendering is finished", () => {});
    then("Course name should be displayed", () => {
      const lbl = wrapper.find(".breadcrumb-lbl").first();

      expect(lbl.text()).toBe("COURSE NAME");
    });
  });

  test("Anchor label is changed by tree item", ({ given, when, then }) => {
    given("Header component", () => {});
    when("User select item in a tree", () => {
      props.tree.item = element;
      wrapper.setProps(props);
    });
    then("Anchor label should match item name", () => {
      testAnchorLabel(wrapper, element.name);
    });
    when("User deselecct item in a tree", () => {
      props.tree.item = undefined;
      wrapper.setProps(props);
    });
    then("Anchor label should match default label.", () => {
      testAnchorLabel(wrapper, LOCALES.STRUCTURE_HEADER);
    });
  });

  test("Should toogle structures panel when clicking", ({ when, then, and }) => {
    when("Clicking the component", () => {
      simulateAnchorClick(wrapper);
      toggleStruturesPanel(wrapper, props);
    });
    then("Structure panel should be closed", () => {
      expect(props.toggleStructurePanel).toHaveBeenCalledTimes(2);
    });
    and("Header anchor icon should be changed to close", () => {
      testAnchorIcon(wrapper, false);
    });
    when("Clicking the component again", () => {
      simulateAnchorClick(wrapper);
      toggleStruturesPanel(wrapper, props);
    });
    then("Structure panel should be opened", () => {
      expect(props.toggleStructurePanel).toHaveBeenCalledTimes(3);
    });
    and("Header anchor icon should be changed to open", () => {
      testAnchorIcon(wrapper, true);
    });
  });
});
