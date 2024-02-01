import { fetchAPI } from "redux/api";
import * as actions from "../types";

export const getCourseStyle = (id: string) => {
  return fetchAPI({
    url: "api/style_folder/" + id,
    method: "GET",
    authenticated: true,
    types: [
      actions.GET_COURSE_STYLE_STARTED,
      actions.GET_COURSE_STYLE_SUCCESS,
      actions.GET_COURSE_STYLE_ERROR,
    ],
  });
};
