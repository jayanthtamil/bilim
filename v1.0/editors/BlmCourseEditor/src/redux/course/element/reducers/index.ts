import * as actions from "../types";
import { createPropertiesModel, createTemplatesModel } from "../utils";
import { createCourseStructureModel } from "redux/course/structure/utils/index";

export const initState: actions.CourseElementState = {
  properties: {},
  templates: undefined,
  structures: undefined,
};

export default function elementReducer(
  state = initState,
  action: actions.ElementActions
): actions.CourseElementState {
  state = typeof state !== "undefined" ? state : initState;
  const { templates } = state;

  switch (action.type) {
    case actions.GET_ELEMENT_PROPERTIES_SUCCESS:
      const { payload, meta } = action;
      const props = createPropertiesModel(payload, meta);

      return {
        ...state,
        properties: { ...state.properties, [meta.id]: props },
      };
    case actions.UPDATE_ELEMENT_PROPERTIES_SUCCESS:
      const { meta: props2 } = action;

      if (props2 && state.properties[props2.id]) {
        return {
          ...state,
          properties: { ...state.properties, [props2.id]: props2 },
        };
      }

      return state;
    case actions.CLEAR_ELEMENT_PROPERTIES:
      const { id } = action.payload;

      if (id) {
        const { [id]: newId, ...others } = state.properties;

        return {
          ...state,
          properties: { ...others },
        };
      } else {
        return {
          ...state,
          properties: {},
        };
      }
    case actions.GET_ELEMENT_TEMPLATES_STARTED:
      return {
        ...state,
        templates: templates && templates.id === action.meta.id ? templates : undefined,
      };
    case actions.GET_SELECTED_ELEMENT_TEMPLATES_STARTED:
      return {
        ...state,
        templates: templates && templates.id === action.meta ? templates : undefined,
      };
    case actions.GET_ELEMENT_TEMPLATES_SUCCESS:
      return {
        ...state,
        templates: createTemplatesModel(action.payload, action.meta),
      };
    case actions.RESET_ELEMENT_TEMPLATE_SUCCESS:
      return {
        ...state,
        templates: undefined,
      };
    case actions.GET_COPY_FROM_STRUCTURE_LIST_SUCCESS:
      return {
        ...state,
        structures: createCourseStructureModel(action.payload),
      };
    default:
      return state;
  }
}
