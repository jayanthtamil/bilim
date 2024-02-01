import { defineFeature, loadFeature } from "jest-cucumber";

import reducer from "./index";
import * as actions from "../types";
import { convertToPropertiesModel } from "../utils";
import { initState } from "./index";

const feature = loadFeature("./properties.feature");
const courseId = "87";
const properties: actions.CoursePropsResponse = {
  nid: courseId,
  type: "course",
  title: "Test",
  dispaly: "desktop",
  duration: "",
  desc: "Test",
  language: "english",
  eval_param: "",
  isevaluation: "",
  keywords: "",
  metadatas: "",
  no_of_words: "",
  objectives: "",
  short_desc: "",
  taxonomy: "",
  thumbnail: "",
  url_edit: "",
  crs_version: "",
  created: "11/12/2020",
  changed: "11/12/2020",
};

defineFeature(feature, (test) => {
  test("Initialize course properties", ({ when }) => {
    when("Should handle INITIALIZE_COURSE_PROPERTIES action", () => {
      expect(
        reducer(initState, {
          type: actions.INITIALIZE_COURSE_PROPERTIES,
          payload: { id: courseId },
        })
      ).toEqual({
        ...initState,
        id: courseId,
      });
    });
  });

  test("Get course properties started", ({ when }) => {
    when("Should handle GET_COURSE_PROPERTIES_STARTED action", () => {
      expect(
        reducer(initState, {
          type: actions.GET_COURSE_PROPERTIES_STARTED,
          payload: "",
          error: false,
        })
      ).toEqual({
        ...initState,
      });
    });
  });

  test("Get course properties success", ({ when }) => {
    when("Should handle GET_COURSE_PROPERTIES_SUCCESS action", () => {
      expect(
        reducer(initState, {
          type: actions.GET_COURSE_PROPERTIES_SUCCESS,
          payload: properties,
          error: false,
        })
      ).toEqual({
        ...initState,
        properties: convertToPropertiesModel(properties),
      });
    });
  });

  test("Get course properties error", ({ when }) => {
    when("Should handle GET_COURSE_PROPERTIES_ERROR action", () => {
      let payload = "error payload";
      expect(
        reducer(initState, {
          type: actions.GET_COURSE_PROPERTIES_ERROR,
          payload,
          error: true,
        })
      ).toEqual({
        ...initState,
      });
    });
  });
});
