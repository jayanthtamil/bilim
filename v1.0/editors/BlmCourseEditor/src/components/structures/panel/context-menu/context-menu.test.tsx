import React from "react";
import { Popover } from "@material-ui/core";
import { shallow, ShallowWrapper } from "enzyme";
import { defineFeature, loadFeature } from "jest-cucumber";

import { CourseStructure, ContextMenuData, CourseElement } from "types";
import { StructureType, ElementType } from "editor-constants";
import BlmContextMenu, { CompProps } from "./BlmContextMenu";

const feature = loadFeature("./context-menu.feature");

const anchor = document.createElement("div");
const element = new CourseElement("12", "Screen", ElementType.Screen);
const data = new ContextMenuData(anchor, element, StructureType.Structure);
const structure: CourseStructure = new CourseStructure();
structure.starting = new CourseElement("21", "Annexes", StructureType.Starting);
structure.structure = new CourseElement("21", "Structure", StructureType.Structure);
structure.annexes = new CourseElement("21", "Annexes", StructureType.Annexes);

const structures = {
  structure,
  addchild: "",
  renameChild: "",
  deleteElement: "",
  duplicateElement: "",
  dragDropElement: "",
  connectionsData: "",
};

function setup() {
  const props: CompProps = {
    data: undefined,
    structures: structures,
    onClose: jest.fn(),
    openConfirmDialog: jest.fn(),
    clickAddAction: jest.fn(),
    clickRenameAction: jest.fn(),
    createElement: jest.fn(),
    duplicateElement: jest.fn(),
    selectTreeItem: jest.fn(),
    updateElementConnection: jest.fn(),
  };

  const wrapper = shallow<CompProps>(<BlmContextMenu {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Display Context Menu without Popover menu", ({ given, when, then }) => {
    given("Context menu component", () => {});
    when("Data is not given", () => {});
    then("Popover menu should not be displayed", () => {
      assertHasPopoverMenu(wrapper, false);
    });
  });

  test("Display Context Menu with Popover menu", ({ given, when, then }) => {
    given("Context menu component", () => {});
    when("Data is given", () => {
      props.data = data;
      wrapper.setProps(props);
    });
    then("Popover menu should be displayed", () => {
      assertHasPopoverMenu(wrapper, true);
      assertPopoverMenuIsOpened(wrapper, props.data);
    });
  });
});

function assertHasPopoverMenu(wrapper: ShallowWrapper<CompProps>, hasMenu: boolean) {
  const menu = wrapper.find(Popover);

  if (hasMenu) {
    expect(menu).toHaveLength(1);
  } else {
    expect(menu).toHaveLength(0);
  }
}

function assertPopoverMenuIsOpened(
  wrapper: ShallowWrapper<CompProps>,
  menuData: CompProps["data"]
) {
  const menu = wrapper.find(Popover);
  const props = menu.props();
  const open = menuData ? true : false;

  expect(props.open).toBe(open);

  if (open) {
    expect(props.anchorEl).toBe(menuData?.anchor);
  } else {
    expect(props.anchorEl).toBeNull();
  }
}
