import React from "react";
import { defineFeature, loadFeature } from "jest-cucumber";
import { mount, ReactWrapper } from "enzyme";
import Tree, { TreeNode, TreeNodeProps } from "rc-tree";

import { CourseElement } from "types";
import { StructureType, ElementType } from "editor-constants";
import { TreeCompProps } from "./types";
import BlmCourseTree from "./BlmCourseTree";

const feature = loadFeature("./course-tree.feature");

const structures = new CourseElement("11", "Test", StructureType.Structure);
const chapter = new CourseElement("22", "Chapter", ElementType.Chapter);
const screen1 = new CourseElement("33", "Screen 1", ElementType.Screen);
const screen2 = new CourseElement("44", "Screen 2", ElementType.Screen);
chapter.children = [screen1, screen2];
structures.children = [chapter];

function setup() {
  const props: TreeCompProps = {
    treeType: StructureType.Structure,
    data: structures,
    selectedItem: undefined,
    ctxItem: undefined,
    renameClick: undefined,
    addClick: undefined,
    evaluationProperties: undefined,
    dragDropElement: jest.fn(),
    renameElement: jest.fn(),
    clickRenameAction: jest.fn(),
    createElement: jest.fn(),
    clickAddAction: jest.fn(),
    getCourseStructure: jest.fn(),
    onTreeOptionsClick: jest.fn(),
    selectTreeItem: jest.fn(),
  };

  const wrapper = mount(<BlmCourseTree {...props} />);

  return {
    props,
    wrapper,
  };
}

defineFeature(feature, (test) => {
  const { props, wrapper } = setup();

  test("Display data in tree", ({ given, when, then }) =>
    then("tree data is displayed in response", () => {
      openTree(wrapper);
      const tree = wrapper.find("Tree");

      testTreeNodes(tree, props.data);
    }));
});

function testTreeNodes(wrapper: ReactWrapper, data: CourseElement) {
  if (data.children && data.children.length) {
    const treeNodes = getDirectTreeNodes(wrapper);

    expect(treeNodes.length).toBe(data.children.length);

    for (let i = 0; i < data.children.length; i++) {
      const element = data.children[i];
      const treeNode = treeNodes.at(i);
      const treeNodeData = treeNode.props().data;

      expect(treeNodeData).toBe(element);

      if (element.children) {
        testTreeNodes(treeNode, element);
      }
    }
  }
}

function openTree(wrapper: ReactWrapper) {
  const tree = wrapper.find(Tree);

  openTreeItems(wrapper, tree);
}

function openTreeItems(root: ReactWrapper, wrapper: ReactWrapper) {
  const items = wrapper.find(TreeNode);

  for (let i = 0; i < items.length; i++) {
    const item = items.at(i);

    openTreeItem(root, item);
  }
}

function openTreeItem(root: ReactWrapper, wrapper: ReactWrapper<TreeNodeProps>) {
  const element = wrapper.props().data;
  const switcher = wrapper.find(".rc-tree-switcher");

  if (switcher.length > 0) {
    switcher.simulate("click");
    const updatedWrapper = root.find({
      data: element,
    }) as ReactWrapper<TreeNodeProps>;

    openTreeItems(root, updatedWrapper.find(".rc-tree-child-tree"));
  }
}

function getDirectTreeNodes(wrapper: ReactWrapper): ReactWrapper<TreeNodeProps> {
  if (wrapper.children().length && wrapper.children().children(TreeNode).length) {
    return wrapper.children().children(TreeNode);
  }
  return getDirectTreeNodes(wrapper.children());
}
