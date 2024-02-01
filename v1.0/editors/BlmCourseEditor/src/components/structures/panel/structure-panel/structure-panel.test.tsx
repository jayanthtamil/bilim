import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { defineFeature, loadFeature } from "jest-cucumber";
import { Popper } from "@material-ui/core";

import { CourseStructure } from "types";
import BlmStructurePanel, { CompProps } from "./BlmStructurePanel";

const feature = loadFeature("./structure-panel.feature");

const structure = new CourseStructure();
const div = document.createElement("div");

function setup() {
  const props: CompProps = {
    structure: undefined,
    panel: { open: true, anchorEle: div },
  };

  const wrapper = shallow(<BlmStructurePanel {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Display Structures panel without Popper", ({ given, when, then }) => {
    given("Structure panel component", () => {});
    when("Data is not given", () => {});
    then("Popper panel should not be displayed", () => {
      assertHasPopper(wrapper, false);
    });
  });

  test("Display Structures panel with Popper", ({ given, when, then }) => {
    given("Structure panel component", () => {});
    when("Data is given", () => {
      props.structure = structure;
      wrapper.setProps(props);
    });
    then("Popper panel should be displayed", () => {
      assertHasPopper(wrapper, true);
    });
  });

  test("Popper panel should controled by props", ({ given, when, then }) => {
    given("Structure panel component", () => {});
    when("panel.open is true", () => {
      props.panel.open = true;
      wrapper.setProps(props);
    });
    then("Popper panel should be opened", () => {
      assertPopperIsOpened(wrapper, props.panel);
    });
    when("panel.open is false", () => {
      props.panel.open = false;
      wrapper.setProps(props);
    });
    then("Popper panel should be closed", () => {
      assertPopperIsOpened(wrapper, props.panel);
    });
  });
});

function assertHasPopper(wrapper: ShallowWrapper, hasPopper: boolean) {
  const popper = wrapper.find(Popper);

  if (hasPopper) {
    expect(popper).toHaveLength(1);
  } else {
    expect(popper).toHaveLength(0);
  }
}

function assertPopperIsOpened(wrapper: ShallowWrapper, panel: CompProps["panel"]) {
  const popper = wrapper.find(Popper);
  const props = popper.props();

  expect(props.open).toBe(panel.open);

  if (panel.open) {
    expect(props.anchorEl).toBe(panel.anchorEle);
  } else {
    expect(props.anchorEl).toBeNull();
  }
}
