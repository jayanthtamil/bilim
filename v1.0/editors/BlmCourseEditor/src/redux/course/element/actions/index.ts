import { CourseElement, CourseElementProps, CourseElementTemplate } from "types";
import { ElementType } from "editor-constants";
import { findIndex } from "utils";
import { getAllMedias } from "template-builders";
import { fetchAPI } from "redux/api";
import { ApiThunkAction } from "redux/types";
import * as actions from "../types";
import {
  createPropertiesAPI,
  createTemplatesAPI,
  resetTemplatesAPI,
  createDuplicateTemplatesAPI,
} from "../utils";

export const getElementProperties = (element: CourseElement) => {
  return fetchAPI({
    url: "api/" + element.type + "/" + element.id,
    method: "GET",
    authenticated: true,
    meta: element,
    types: [
      actions.GET_ELEMENT_PROPERTIES_STARTED,
      actions.GET_ELEMENT_PROPERTIES_SUCCESS,
      actions.GET_ELEMENT_PROPERTIES_ERROR,
    ],
  });
};

export const updateElementProperties = (properties: CourseElementProps) => {
  const body = createPropertiesAPI(properties);

  return fetchAPI({
    url: "api/" + properties.type + "/" + properties.id,
    method: "PATCH",
    authenticated: true,
    meta: properties,
    body: JSON.stringify(body),
    types: [
      actions.UPDATE_ELEMENT_PROPERTIES_STARTED,
      actions.UPDATE_ELEMENT_PROPERTIES_SUCCESS,
      actions.UPDATE_ELEMENT_PROPERTIES_ERROR,
    ],
  });
};

export const clearElementProperties = (id?: string) => {
  return {
    type: actions.CLEAR_ELEMENT_PROPERTIES,
    payload: { id },
  };
};

export const getElementTemplates = (element: CourseElement) => {
  return fetchAPI({
    url: "api/pp_template/" + element.id,
    method: "GET",
    authenticated: true,
    meta: element,
    types: [
      actions.GET_ELEMENT_TEMPLATES_STARTED,
      actions.GET_ELEMENT_TEMPLATES_SUCCESS,
      actions.GET_ELEMENT_TEMPLATES_ERROR,
    ],
  });
};

export const getElementTemplateVal = (elementId: string) => {
  return fetchAPI({
    url: "api/pp_template/" + elementId,
    method: "GET",
    authenticated: true,
    meta: elementId,
    types: [
      actions.GET_SELECTED_ELEMENT_TEMPLATES_STARTED,
      actions.GET_SELECTED_ELEMENT_TEMPLATES_SUCCESS,
      actions.GET_SELECTED_ELEMENT_TEMPLATES_ERROR,
    ],
  });
};

export const getCopyFromDomainList = () => {
  return fetchAPI({
    url: "api/domain_list",
    method: "GET",
    authenticated: true,
    types: [
      actions.GET_COPY_FROM_DOMAIN_LIST_STARTED,
      actions.GET_COPY_FROM_DOMAIN_LIST_SUCCESS,
      actions.GET_COPY_FROM_DOMAIN_LIST_ERROR,
    ],
  });
};

export const getCopyFromDomainCategory = (domainId: number) => {
  let body = {
    id: domainId,
  };
  return fetchAPI({
    url: "api/domain_categories/" + domainId,
    method: "GET",
    authenticated: true,
    meta: JSON.stringify(body),
    types: [
      actions.GET_COPY_FROM_DOMAIN_CATEGORY_STARTED,
      actions.GET_COPY_FROM_DOMAIN_CATEGORY_SUCCESS,
      actions.GET_COPY_FROM_DOMAIN_CATEGORY_ERROR,
    ],
  });
};

export const getCopyFromSubFolderList = (id1: string, id2: any, id3: any) => {
  return fetchAPI({
    url: "api/domain_sub_categories/" + id3 + "/" + id2 + "/" + id1,
    method: "GET",
    authenticated: true,
    types: [
      actions.GET_COPY_FROM_SUB_FOLDER_STARTED,
      actions.GET_COPY_FROM_SUB_FOLDER_SUCCESS,
      actions.GET_COPY_FROM_SUB_FOLDER_ERROR,
    ],
  });
};

export const getCopyFromStructureList = (categoryId: number) => {
  return fetchAPI({
    url: "api/course_tree/" + categoryId,
    method: "GET",
    authenticated: true,
    types: [
      actions.GET_COPY_FROM_STRUCTURE_LIST_STARTED,
      actions.GET_COPY_FROM_STRUCTURE_LIST_SUCCESS,
      actions.GET_COPY_FROM_STRUCTURE_LIST_ERROR,
    ],
  });
};

export const saveTemplates =
  (element: CourseElement, template: CourseElementTemplate, position = 0): ApiThunkAction =>
  (dispatch, getState) => {
    const {
      course: {
        element: { templates: { templates } = {} },
      },
    } = getState();

    if (element) {
      if (element.type === ElementType.Page || element.type === ElementType.SimplePage) {
        if (templates && templates.length !== 0) {
          const newTemplates = [...templates];

          if (template.id === "") {
            //For new templates
            newTemplates.splice(position, 0, template);
          } else {
            const ind = findIndex(newTemplates, template.id, "id");

            if (ind !== -1) {
              newTemplates.splice(ind, 1, template);
            }
          }

          dispatch(updateElementTemplates(element.id, newTemplates));
        } else {
          dispatch(updateElementTemplates(element.id, [template]));
        }
      } else if (
        element.type === ElementType.Screen ||
        element.type === ElementType.Question ||
        element.type === ElementType.SimpleContent
      ) {
        if (template) {
          dispatch(updateElementTemplates(element.id, template));
        }
      }
    } else {
      return undefined;
    }
  };

export const updateElementTemplates = (
  elementId: string,
  templates: CourseElementTemplate | CourseElementTemplate[],
  duplicate?: string
) => {
  var body;
  if (duplicate) {
    body = createDuplicateTemplatesAPI(templates);
  } else {
    body = createTemplatesAPI(templates);
  }

  return fetchAPI({
    url: "api/pp_template/" + elementId,
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(body),
    // meta: element,
    types: [
      actions.UPDATE_ELEMENT_TEMPLATES_STARTED,
      actions.UPDATE_ELEMENT_TEMPLATES_SUCCESS,
      actions.UPDATE_ELEMENT_TEMPLATES_ERROR,
    ],
  });
};

export const duplicateElementTemplate = (
  parent: CourseElement,
  template: CourseElementTemplate
) => {
  let body = {
    parent: parent.id,
    action: "duplicate",
  };

  return fetchAPI({
    url: "api/pp_template/new/" + template.id,
    method: "POST",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.DUPLICATE_ELEMENT_TEMPLATE_STARTED,
      actions.DUPLICATE_ELEMENT_TEMPLATE_SUCCESS,
      actions.DUPLICATE_ELEMENT_TEMPLATE_ERROR,
    ],
  });
};

export const duplicateImageTemplate = (payload: any) => {
  return fetchAPI({
    url: "api/media/new",
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
    types: [
      actions.UPDATE_DUPLICATE_IMAGE_STARTED,
      actions.UPDATE_DUPLICATE_IMAGE_SUCCESS,
      actions.UPDATE_DUPLICATE_IMAGE_ERROR,
    ],
  });
};

export const deleteElementTemplate = (parent: CourseElement, template: CourseElementTemplate) => {
  let body = {
    parent: parent.id,
  };

  return fetchAPI({
    url: "api/pp_template/" + template.id,
    method: "DELETE",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.DELETE_ELEMENT_TEMPLATE_STARTED,
      actions.DELETE_ELEMENT_TEMPLATE_SUCCESS,
      actions.DELETE_ELEMENT_TEMPLATE_ERROR,
    ],
  });
};

export const positionElementTemplate = (
  element: CourseElement,
  templates: CourseElementTemplate[]
) => {
  let body = {
    templateIds: templates.map((template) => template.id),
  };

  return fetchAPI({
    url: "api/pp_position/" + element.id,
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.POSITION_ELEMENT_TEMPLATE_STARTED,
      actions.POSITION_ELEMENT_TEMPLATE_SUCCESS,
      actions.POSITION_ELEMENT_TEMPLATE_ERROR,
    ],
  });
};

export const resetElementTemplate =
  (element: CourseElement): ApiThunkAction =>
  (dispatch, getState) => {
    const callback = () => {
      const {
        course: {
          element: { templates },
        },
      } = getState();

      if (templates?.templates) {
        templates.templates.forEach((template) => {
          return dispatch(resetTemplate(template));
        });
      }

      return undefined;
    };

    const {
      course: {
        element: { templates },
      },
    } = getState();

    if (templates?.id === element.id) {
      return callback();
    } else {
      return dispatch(getElementTemplates(element)).then((result) => {
        if (!result.error) {
          callback();
        }

        return result;
      });
    }
  };

export const resetTemplate = (template: CourseElementTemplate) => {
  const medias = getAllMedias(template);
  const body = resetTemplatesAPI(medias);

  return fetchAPI({
    url: "api/reset_template/" + template.id,
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.RESET_ELEMENT_TEMPLATE_STARTED,
      actions.RESET_ELEMENT_TEMPLATE_SUCCESS,
      actions.RESET_ELEMENT_TEMPLATE_ERROR,
    ],
  });
};
