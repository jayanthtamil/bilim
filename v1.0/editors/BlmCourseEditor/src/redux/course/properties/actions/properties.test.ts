import { defineFeature, loadFeature } from "jest-cucumber";
import configureMockStore from "redux-mock-store";
import fetchMock from "fetch-mock-jest";

import middlewares from "redux/middlewares";
import { AppThunkDispatch } from "redux/types";
import * as types from "../types";
import * as actions from "./index";

const feature = loadFeature("./properties.feature");

const courseId = "87";
const initState = {
  course: { properties: { id: courseId } },
  user: { token: "12345" },
};
const mockStore = configureMockStore<typeof initState, AppThunkDispatch>(middlewares);
const store = mockStore(initState);

defineFeature(feature, (test) => {
  beforeEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  test("Initialize course properties", ({ when }) => {
    when("Should create INITIALIZE_COURSE_PROPERTIES action", () => {
      const expectedAction = {
        type: types.INITIALIZE_COURSE_PROPERTIES,
        payload: { id: courseId },
      };
      expect(actions.initializeCourseProperties({ id: courseId })).toEqual(expectedAction);
    });
  });

  test("Get course properties", ({ when, then }) => {
    const body = {
      nid: courseId,
      type: "course",
      title: "Course 01",
      dispaly: "desktop",
      desc: "Course 01",
      language: "English",
      created: "2020-01-21 09:48:33",
      changed: "2020-03-24 07:52:53",
    };
    const expectedActions = [
      { type: types.GET_COURSE_PROPERTIES_STARTED },
      { type: types.GET_COURSE_PROPERTIES_SUCCESS, payload: body },
    ];
    when("Get course properties has been done", () => {
      fetchMock.mock("path:/bilim/v1.0/bilim_cms/api/course_document_module/" + courseId, {
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
      });
      return store.dispatch(actions.getCourseProperties());
    });
    then(
      "Should create GET_COURSE_PROPERTIES_STARTED and GET_COURSE_PROPERTIES_SUCCESS actions",
      () => {
        expect(store.getActions()).toEqual(expect.arrayContaining(expectedActions));
      }
    );
  });
});
