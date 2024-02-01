import { defineFeature, loadFeature } from "jest-cucumber";

import * as actions from "../types";
import { createPropertiesModel } from "../utils";
import reducer, { initState } from "./index";

const feature = loadFeature("./element.feature");

const properties: actions.ElementPropsResponse = {
  nid: "2675",
  type: "chapter",
  title: "Chapter 2 two",
  title2: "",
  description: "",
  eval_param: "",
  cust_comp: "0",
  cust_comp_param: "null",
  media_param: "null",
  isevaluation: "true",
  hasfeedback: "true",
  duration: "",
  theme_ref: "Split",
  created: "2020-06-02 07:43:07",
  changed: "2020-06-25 14:16:29",
};

defineFeature(feature, (test) => {
  test("Course element properties reducer", ({ when }) => {
    when("Should handle all api start actions", () => {
      const payload = "element";
      const expectedState = { ...initState, element: payload };
      const types = [
        actions.GET_ELEMENT_PROPERTIES_STARTED,
        actions.UPDATE_ELEMENT_PROPERTIES_STARTED,
      ];

      for (let type of types) {
        expect(
          reducer(initState, {
            type,
            payload,
            meta: payload,
            error: false,
          } as actions.ElementActions)
        ).toEqual(expectedState);
      }
    });

    when("Should handle GET_ELEMENT_PROPERTIES_SUCCESS action", () => {
      expect(
        reducer(initState, {
          type: actions.GET_ELEMENT_PROPERTIES_SUCCESS,
          payload: properties,
          error: false,
        })
      ).toEqual({
        ...initState,
        properties: createPropertiesModel(properties),
      });
    });

    when("Should handle UPDATE_ELEMENT_PROPERTIES_SUCCESS action", () => {
      expect(
        reducer(initState, {
          type: actions.UPDATE_ELEMENT_PROPERTIES_SUCCESS,
          payload: "properties",
          error: false,
        })
      ).toEqual({ ...initState, properties: "properties" });
    });

    when("Should handle all api error actions", () => {
      const types = [
        actions.UPDATE_ELEMENT_PROPERTIES_ERROR,
        actions.UPDATE_ELEMENT_PROPERTIES_ERROR,
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
          } as actions.ElementActions)
        ).toEqual(expectedState);
      }
    });
  });
});
