import { defineFeature, loadFeature } from "jest-cucumber";

import * as actions from "../types";
import reducer, { initState } from "./index";

const feature = loadFeature("./domain.feature");

defineFeature(feature, (test) => {
  test("Domain reducer for templates and themes", ({ when }) => {
    when("Should handle all api start actions", () => {
      const expectedState = { ...initState };
      const types = [actions.GET_THEMES_STARTED, actions.GET_TEMPLATES_STARTED];

      for (let type of types) {
        expect(
          reducer(initState, {
            type,
          } as actions.DomainActions)
        ).toEqual(expectedState);
      }
    });

    when("Should handle GET_THEMES_SUCCESS action", () => {
      expect(
        reducer(initState, {
          type: actions.GET_THEMES_SUCCESS,
          payload: [],
          error: false,
        })
      ).toEqual({
        ...initState,
        themes: [],
      });
    });

    when("Should handle GET_TEMPLATES_SUCCESS action", () => {
      expect(
        reducer(initState, {
          type: actions.GET_TEMPLATES_SUCCESS,
          payload: [],
          error: false,
        })
      ).toEqual({ ...initState, templates: [] });
    });

    when("Should handle all api error actions", () => {
      const types = [actions.GET_THEMES_ERROR, actions.GET_TEMPLATES_ERROR];
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
          } as actions.DomainActions)
        ).toEqual(expectedState);
      }
    });
  });
});
