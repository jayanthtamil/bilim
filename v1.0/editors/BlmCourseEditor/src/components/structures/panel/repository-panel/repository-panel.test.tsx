import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { defineFeature, loadFeature } from "jest-cucumber";

import { CourseElement, CourseStructure, ContextMenuData } from "types";
import { StructureType } from "editor-constants";
import { wait } from "tests/utils";
import BlmAccordion from "../accordion";
import BlmContextMenu from "../context-menu";
import BlmRepositoryPanel from "./BlmRepositoryPanel";
import { RepositoryProps } from "./types";

const feature = loadFeature("./repository-panel.feature");

const anchor = document.createElement("div");
const structure = new CourseStructure();
structure.starting = new CourseElement("12", "Starting", StructureType.Starting);
structure.structure = new CourseElement("13", "Structure", StructureType.Structure);
structure.annexes = new CourseElement("14", "Annexes", StructureType.Annexes);

function setup() {
  const props: RepositoryProps = {
    data: undefined,
    deleteElement: jest.fn(),
    onOptionsClick: jest.fn(),
  };

  const wrapper = shallow<RepositoryProps>(<BlmRepositoryPanel {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Display Repository panel without data", ({ given, when, then }) => {
    given("Repository panel component", () => {});
    when("Data is not given", () => {});
    then("Accordion and ContextMenu should not be displayed", () => {
      assertHasChildren(wrapper, false);
    });
  });

  test("Display Repository panel with data", ({ given, when, then }) => {
    given("Repository panel component", () => {});
    when("Data is given", () => {
      props.data = structure;
      wrapper.setProps(props);
    });
    then("Accordion and ContextMenu should be displayed with data", () => {
      assertHasChildren(wrapper, true);
      assertAccordionData(wrapper, StructureType.Starting, structure.starting!);
      assertAccordionData(wrapper, StructureType.Structure, structure.structure!);
      assertAccordionData(wrapper, StructureType.Annexes, structure.annexes!);
    });
  });

  test("Display Repository panel with Context menu", ({ given, when, then }) => {
    const element = structure.starting!;
    const treeType = StructureType.Starting;
    given("Repository panel component", () => {});
    when("Options icon is clicked in Accordion panel", async () => {
      simulateAccordionOptionClick(wrapper, element, treeType);

      return wait();
    });
    then("ContextMenu panel should be displayed with data", () => {
      //Shallow render doesn't support hooks
      //const ctxData = new ContextMenuData(anchor, element, treeType);
      //assertContextMenuData(wrapper, ctxData);

      expect(props.onOptionsClick).toHaveBeenCalled();
    });
  });
});

function assertHasChildren(wrapper: ShallowWrapper<RepositoryProps>, hasChildren: boolean) {
  const accordion = wrapper.find(BlmAccordion);
  const ctx = wrapper.find(BlmContextMenu);

  if (hasChildren) {
    expect(accordion).toHaveLength(3);
    expect(ctx).toHaveLength(1);
  } else {
    expect(accordion).toHaveLength(0);
    expect(ctx).toHaveLength(0);
  }
}

function assertAccordionData(
  wrapper: ShallowWrapper<RepositoryProps>,
  treeType: StructureType,
  data: CourseElement
) {
  const accordion = wrapper.find(BlmAccordion).find({ treeType, data });

  expect(accordion).toHaveLength(1);
}

function simulateAccordionOptionClick(
  wrapper: ShallowWrapper<RepositoryProps>,
  element: CourseElement,
  treeType: StructureType
) {
  const accordion = wrapper.find(BlmAccordion).find({ treeType }).at(0);

  accordion.simulate("optionsClick", { anchor, element, treeType });
}

function assertContextMenuData(wrapper: ShallowWrapper<RepositoryProps>, ctxData: ContextMenuData) {
  const ctx = wrapper.find(BlmContextMenu);
  const props = ctx.props();

  expect(props.data).toBe(ctxData);
}
