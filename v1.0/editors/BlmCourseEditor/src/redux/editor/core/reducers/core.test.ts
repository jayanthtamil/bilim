import { defineFeature, loadFeature } from "jest-cucumber";

import { CourseElement, CourseElementProps } from "types";
import { ElementType } from "editor-constants";
import * as actions from "../types";
import reducer, { initState } from "./index";

const feature = loadFeature("./element.feature");

defineFeature(feature, (test) => {
  const anchorEle = document.createElement("div");
  const element = new CourseElement("12", "test", ElementType.Screen);

  test("Editor structures reducer", ({ when }) => {
    when("Should handle SELECT_TREE_ITEM action", () => {
      expect(
        reducer(initState, {
          type: actions.SELECT_TREE_ITEM,
          payload: { item: element, node: treeNode },
        })
      ).toEqual({
        ...initState,
        tree: { item: element, node: treeNode },
      });
    });

    when("Should handle SET_STRUCTURES_ANCHOR_ELE action", () => {
      expect(
        reducer(initState, {
          type: actions.SET_STRUCTURE_ANCHOR_ELE,
          payload: { element: treeNode },
        })
      ).toEqual({
        ...initState,
        panel: { ...initState.panel, anchorEle: treeNode },
      });
    });

    when("Should handle TOGGLE_STRUCTURES_PANEL action", () => {
      expect(
        reducer(initState, {
          type: actions.TOGGLE_STRUCTURE_PANEL,
          payload: { open: true },
        })
      ).toEqual({ ...initState, panel: { ...initState.panel, open: true } });

      expect(
        reducer(
          { ...initState, panel: { ...initState.panel, open: true } },
          {
            type: actions.TOGGLE_STRUCTURE_PANEL,
            payload: {},
          }
        )
      ).toEqual({ ...initState, panel: { ...initState.panel, open: false } });
    });

    when("Should handle CLICK_RENAME_ACTION action", () => {
      expect(
        reducer(initState, {
          type: actions.CLICK_RENAME_ACTION,
          payload: element,
        })
      ).toEqual({ ...initState, renameClick: element });
    });

    when("Should handle CLICK_ADD_ACTION action", () => {
      const addAcion: TreeAddAction = {
        SelectedAction: "AddScreen",
        selectedNode: { item: element },
      };
      expect(
        reducer(initState, {
          type: actions.CLICK_ADD_ACTION,
          payload: addAcion,
        })
      ).toEqual({ ...initState, addClick: addAcion });
    });
  });

  test("Element properties reducer", ({ when }) => {
    when("Should set anchor element on properties panel", () => {
      expect(
        reducer(initState, {
          type: actions.SET_ELEMENT_PROPERTIES_ANCHOR_ELE,
          payload: { element: anchorEle },
        })
      ).toEqual({
        ...initState,
        propertiesPanel: { ...initState.propertiesPanel, anchorEle },
      });
    });

    when("Should toggle element properties panel", () => {
      expect(
        reducer(initState, {
          type: actions.TOGGLE_ELEMENT_PROPERTIES_PANEL,
          payload: { open: true, element },
        })
      ).toEqual({
        ...initState,
        currentElement: element,
        propertiesPanel: { ...initState.propertiesPanel, open: true },
      });

      expect(
        reducer(
          {
            ...initState,
            propertiesPanel: { ...initState.propertiesPanel, open: true },
          },
          {
            type: actions.TOGGLE_ELEMENT_PROPERTIES_PANEL,
            payload: { open: false, element },
          }
        )
      ).toEqual({
        ...initState,
        currentElement: element,
        propertiesPanel: { ...initState.propertiesPanel, open: false },
      });
    });

    when("Should handle element properties tab index action", () => {
      expect(
        reducer(initState, {
          type: actions.SET_ELEMENT_PROPERTIES_TAB_INDEX,
          payload: { index: 5 },
        })
      ).toEqual({
        ...initState,
        propertiesPanel: { ...initState.propertiesPanel, tabIndex: 5 },
      });
    });

    when("Should handle click evaluation action", () => {
      const evaluation = new CourseElementProps("12", "evaluation", ElementType.Chapter);
      expect(
        reducer(initState, {
          type: actions.CLICK_EVALUATION_ACTION,
          payload: { evaluationValue: evaluation },
        })
      ).toEqual({
        ...initState,
        evaluationParams: {
          ...initState.evaluationParams,
          evaluationValue: evaluation,
        },
      });
    });
  });
});
