import * as actions from "../types";
import { createCourseStructureModel } from "../utils";

export const initState: actions.StructureState = {
  structure: undefined,
};

export default function structureReducer(
  state = initState,
  action: actions.CourseStructureActions
): actions.StructureState {
  state = typeof state !== "undefined" ? state : initState;

  switch (action.type) {
    case actions.GET_COURSE_STRUCTURE_SUCCESS:
      return {
        ...state,
        structure: createCourseStructureModel(action.payload),
      };
    default:
      return state;
  }
}
