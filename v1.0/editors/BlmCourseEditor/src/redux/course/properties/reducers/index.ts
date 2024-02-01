import * as actions from "../types";
import { createPropertiesModel } from "../utils";

export const initState: actions.CoursePropsState = {
  id: undefined,
  properties: undefined,
};

export default function propertiesReducer(
  state = initState,
  action: actions.CourseActions
): actions.CoursePropsState {
  switch (action.type) {
    case actions.INITIALIZE_COURSE_PROPERTIES:
      return {
        ...state,
        id: action.payload.id,
      };
    case actions.GET_COURSE_PROPERTIES_SUCCESS:
      return {
        ...state,
        properties: createPropertiesModel(action.payload),
      };
    case actions.UPDATE_COURSE_PROPERTIES_SUCCESS: {
      const { meta: properties } = action;

      return {
        ...state,
        properties,
      };
    }
    default:
      return state;
  }
}
