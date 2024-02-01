import { defineFeature, loadFeature } from "jest-cucumber";

import { CourseElement, CourseElementProps } from "types";
import { ElementType } from "editor-constants";
import * as types from "../types";
import * as actions from "./index";

const feature = loadFeature("./element.feature");

defineFeature(feature, (test) => {
  const treeNode = document.createElement("div");
  const element = new CourseElement("12", "test", ElementType.Screen);

  test("Structures actions creators", ({ when }) => {
    when("Should create SELECT_TREE_ITEM action", () => {
      const expectedAction = {
        type: types.SELECT_TREE_ITEM,
        payload: { item: element, node: treeNode },
      };
      expect(actions.selectTreeItem(element, treeNode)).toEqual(expectedAction);
    });

    when("Should create SET_STRUCTURES_ANCHOR_ELE action", () => {
      const expectedAction = {
        type: types.SET_STRUCTURE_ANCHOR_ELE,
        payload: { element: treeNode },
      };
      expect(actions.setStructureAnchorEle(treeNode)).toEqual(expectedAction);
    });

    when("Should create TOGGLE_STRUCTURES_PANEL action", () => {
      const expectedAction = {
        type: types.TOGGLE_STRUCTURE_PANEL,
        payload: { open: true },
      };
      expect(actions.toggleStructurePanel(true)).toEqual(expectedAction);
    });

    when("Should create TOGGLE_PIN_UNPIN action", () => {
      const expectedAction = {
        type: types.TOGGLE_PIN_UNPIN,
        payload: { isPinned: true },
      };
      expect(actions.togglePinUnpin(true)).toEqual(expectedAction);
    });

    when("Should create CLICK_RENAME_ACTION action", () => {
      const expectedAction = {
        type: types.CLICK_RENAME_ACTION,
        payload: element,
      };
      expect(actions.clickRenameAction(element)).toEqual(expectedAction);
    });

    when("Should create CLICK_ADD_ACTION action", () => {
      const addAction = {
        SelectedAction: "Add Screen",
        selectedNode: { item: element },
      };
      const expectedAction = {
        type: types.CLICK_ADD_ACTION,
        payload: addAction,
      };
      expect(actions.clickAddAction(addAction)).toEqual(expectedAction);
    });
  });

  test("Element properties actions", ({ when }) => {
    const anchorEle = document.createElement("div");
    const element = new CourseElement("12", "test", ElementType.Screen);

    when("Should create SET_ELEMENT_PROPERTIES_ANCHOR_ELE action", () => {
      const expectedAction = {
        type: types.SET_ELEMENT_PROPERTIES_ANCHOR_ELE,
        payload: { element: anchorEle },
      };
      expect(actions.setElementPropertiesAnchorEle(anchorEle)).toEqual(expectedAction);
    });

    when("Should create TOGGLE_ELEMENT_PROPERTIES_PANEL action", () => {
      const expectedOpenAction = {
        type: types.TOGGLE_ELEMENT_PROPERTIES_PANEL,
        payload: { open: true, element },
      };
      const expectedCloseAction = {
        type: types.TOGGLE_ELEMENT_PROPERTIES_PANEL,
        payload: { open: false, element: undefined },
      };
      expect(actions.openElementPropertiesPanel(element)).toEqual(expectedOpenAction);
      expect(actions.closeElementPropertiesPanel()).toEqual(expectedCloseAction);
    });

    when("Should create SET_ELEMENT_PROPERTIES_TAB_INDEX action", () => {
      const expectedAction = {
        type: types.SET_ELEMENT_PROPERTIES_TAB_INDEX,
        payload: { index: 5 },
      };
      expect(actions.setElementPropertiesTabIndex(5)).toEqual(expectedAction);
    });

    when("Should create CLICK_EVALUATION_ACTION action", () => {
      const evaluation = new CourseElementProps("1", "evaluation", ElementType.Chapter);
      const expectedAction = {
        type: types.CLICK_EVALUATION_ACTION,
        payload: { evaluationValue: evaluation },
      };
      expect(actions.updateTreeEvaluation(evaluation)).toEqual(expectedAction);
    });
  });
});
