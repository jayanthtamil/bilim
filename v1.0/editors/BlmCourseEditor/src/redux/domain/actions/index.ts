import { CourseProps, TemplateBase } from "types";
import { fetchAPI } from "redux/api";
import * as actions from "../types";

export const getThemes = (coutseID: string) => {
  return fetchAPI({
    url: "api/template/theme/" + coutseID,
    method: "GET",
    authenticated: true,
    types: [actions.GET_THEMES_STARTED, actions.GET_THEMES_SUCCESS, actions.GET_THEMES_ERROR],
  });
};

export const getLanguages = () => {
  return fetchAPI({
    url: "api/language",
    method: "GET",
    authenticated: true,
    types: [
      actions.GET_LANGUAGES_STARTED,
      actions.GET_LANGUAGES_SUCCESS,
      actions.GET_LANGUAGES_ERROR,
    ],
  });
};

export const getTemplates = (course: CourseProps) => {
  return fetchAPI({
    url: "api/template/template/" + course.id,
    method: "GET",
    authenticated: true,
    types: [
      actions.GET_TEMPLATES_STARTED,
      actions.GET_TEMPLATES_SUCCESS,
      actions.GET_TEMPLATES_ERROR,
    ],
  });
};

export const getTemplateProperties = (template: TemplateBase) => {
  return fetchAPI({
    url: "api/temp_properties/" + template.id,
    method: "GET",
    authenticated: true,
    types: [
      actions.GET_TEMPLATE_PROPERTIES_STARTED,
      actions.GET_TEMPLATE_PROPERTIES_SUCCESS,
      actions.GET_TEMPLATE_PROPERTIES_ERROR,
    ],
  });
};
