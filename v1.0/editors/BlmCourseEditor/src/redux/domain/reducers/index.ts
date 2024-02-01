import { TemplateCategory } from "types";
import * as actions from "../types";
import {
  createTemplateCategories,
  createThemes,
  updateTemplateProperties,
  createLanguages,
} from "../utils";

export const initState: actions.DomainState = {
  themes: undefined,
  languages: undefined,
  templates: undefined,
};

export default function domainReducer(
  state = initState,
  action: actions.DomainActions
): actions.DomainState {
  switch (action.type) {
    case actions.GET_THEMES_SUCCESS:
      return {
        ...state,
        themes: createThemes(action.payload),
      };
    case actions.GET_LANGUAGES_SUCCESS:
      return {
        ...state,
        languages: createLanguages(action.payload),
      };
    case actions.GET_TEMPLATES_SUCCESS:
      return {
        ...state,
        templates: createTemplateCategories(action.payload),
      };
    case actions.GET_TEMPLATE_PROPERTIES_SUCCESS:
      const templates = updateTemplateProperties(state.templates!, action.payload);

      return {
        ...state,
        templates: [...(templates as TemplateCategory[])],
      };

    default:
      return state;
  }
}
