import * as actions from "../types";
import { convertToStyleModel } from "../utils";

export const initState: actions.CourseStyleState = {
  style: undefined,
};

export default function styleReducer(
  state = initState,
  action: actions.StyleActions
): actions.CourseStyleState {
  switch (action.type) {
    case actions.GET_COURSE_STYLE_STARTED:
      return {
        ...state,
      };
    case actions.GET_COURSE_STYLE_SUCCESS:
      return {
        ...state,
        style: convertToStyleModel(action.payload),
      };
    case actions.GET_COURSE_STYLE_ERROR:
      return {
        ...state,
      };
    default:
      return state;
  }
}
