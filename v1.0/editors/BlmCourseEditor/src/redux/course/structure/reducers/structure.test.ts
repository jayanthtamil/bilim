import { defineFeature, loadFeature } from "jest-cucumber";

import * as actions from "../types";
import { createCourseStructureModel } from "../utils";
import reducer, { initState } from "./index";

const feature = loadFeature("./structure.feature");
const structure: actions.CourseStructureResponse = {
  starting: [
    {
      id: "01",
      name: "Starting",
      type: "starting",
      isevaluation: null,
      hasfeedback: null,
      theme_ref: null,
      eval_param: null,
      connections: null,
      children: [],
    },
  ],
  structure: [
    {
      id: "02",
      name: "Structure",
      type: "structure",
      isevaluation: null,
      hasfeedback: null,
      theme_ref: null,
      eval_param: null,
      connections: null,
      children: [],
    },
  ],
  annexes: [
    {
      id: "03",
      name: "Annexes",
      type: "annexes",
      isevaluation: null,
      hasfeedback: null,
      theme_ref: null,
      eval_param: null,
      connections: null,
      children: [],
    },
  ],
};

defineFeature(feature, (test) => {
  test("Course structures reducer", ({ when }) => {
    when("Should handle all api start actions", () => {
      const types = [
        actions.GET_COURSE_STRUCTURE_STARTED,
        actions.CREATE_ELEMENT_STARTED,
        actions.RENAME_ELEMENT_STARTED,
        actions.DUPLICATE_ELEMENT_STARTED,
        actions.DELETE_ELEMENT_STARTED,
        actions.UPDATE_ELEMENT_CONNECTION_STARTED,
        actions.DRAGDROP_ELEMENT_STARTED,
      ];
      const expectedState = { ...initState };

      for (let type of types) {
        expect(
          reducer(initState, {
            type,
            payload: "",
            error: false,
          } as actions.CourseStructureActions)
        ).toEqual(expectedState);
      }
    });

    when("Should handle all api error actions", () => {
      const types = [
        actions.CREATE_ELEMENT_ERROR,
        actions.RENAME_ELEMENT_ERROR,
        actions.UPDATE_ELEMENT_CONNECTION_ERROR,
        actions.DELETE_ELEMENT_ERROR,
        actions.DUPLICATE_ELEMENT_ERROR,
        actions.GET_COURSE_STRUCTURE_ERROR,
        actions.DRAGDROP_ELEMENT_ERROR,
      ];
      const payload = "error payload";
      const expectedState = {
        ...initState,
      };

      for (let type of types) {
        expect(
          reducer(initState, {
            type,
            payload,
            error: true,
          } as actions.CourseStructureActions)
        ).toEqual(expectedState);
      }
    });

    when("Should handle get course structures success action", () => {
      expect(
        reducer(initState, {
          type: actions.GET_COURSE_STRUCTURE_SUCCESS,
          payload: structure,
          error: false,
        })
      ).toEqual({
        ...initState,
        structure: createCourseStructureModel(structure),
      });
    });

    when("Should handle create element success action", () => {
      expect(
        reducer(initState, {
          type: actions.CREATE_ELEMENT_SUCCESS,
          payload: "addChild",
          error: false,
        })
      ).toEqual({
        ...initState,
        addchild: "addChild",
      });
    });

    when("Should handle rename element success action", () => {
      expect(
        reducer(initState, {
          type: actions.RENAME_ELEMENT_SUCCESS,
          payload: "renameChild",
          error: false,
        })
      ).toEqual({ ...initState, renameChild: "renameChild" });
    });

    when("Should handle update element connection success action", () => {
      expect(
        reducer(initState, {
          type: actions.UPDATE_ELEMENT_CONNECTION_SUCCESS,
          payload: "connectionsData",
          error: false,
        })
      ).toEqual({
        ...initState,
        connectionsData: "connectionsData",
      });
    });

    when("Should handle delete element success action", () => {
      expect(
        reducer(initState, {
          type: actions.DELETE_ELEMENT_SUCCESS,
          payload: "deleteElement",
          error: false,
        })
      ).toEqual({
        ...initState,
        deleteElement: "deleteElement",
      });
    });

    when("Should handle duplicate element success action", () => {
      expect(
        reducer(initState, {
          type: actions.DUPLICATE_ELEMENT_SUCCESS,
          payload: "duplicateElement",
          error: false,
        })
      ).toEqual({
        ...initState,
        duplicateElement: "duplicateElement",
      });
    });
  });
});
