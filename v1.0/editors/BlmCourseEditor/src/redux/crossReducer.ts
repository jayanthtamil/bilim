import { CourseDisplay, TemplateDisplayTypes } from "editor-constants";
import { cloneStructure, compareVersion, isValidLinkedElement, updateObject } from "utils";
import { RootActions, RootState } from "./types";
import {
  GET_COURSE_PROPERTIES_SUCCESS,
  GET_COURSE_STRUCTURE_SUCCESS,
  GET_COURSE_STYLE_SUCCESS,
  RENAME_ELEMENT_SUCCESS,
  UPDATE_COURSE_PROPERTIES_SUCCESS,
} from "./constants";

//https://stackoverflow.com/questions/40900354/updating-state-managed-by-another-reducer
const crossSliceReducer = (state: RootState, action: RootActions) => {
  const { type } = action;
  const {
    course: {
      properties: { properties },
      style: { style },
      element: { templates, properties: elmProperties },
    },
    editor: {
      core: { templatesPanel },
    },
  } = state;

  if (type === GET_COURSE_PROPERTIES_SUCCESS) {
    if (properties) {
      state.editor.core.templatesPanel = {
        ...templatesPanel,
        display:
          properties.display !== CourseDisplay.Smartphone
            ? TemplateDisplayTypes.Desktop
            : TemplateDisplayTypes.Mobile,
      };
    }
  }

  if (
    state.course.structure.structure &&
    (type === GET_COURSE_PROPERTIES_SUCCESS ||
      type === UPDATE_COURSE_PROPERTIES_SUCCESS ||
      type === GET_COURSE_STYLE_SUCCESS ||
      type === GET_COURSE_STRUCTURE_SUCCESS)
  ) {
    const linkedIds =
      properties && properties.propsJSON?.linkedElements?.evaluations?.length
        ? [...properties.propsJSON?.linkedElements?.evaluations]
        : undefined;

    state.course.structure.structure = cloneStructure(state.course.structure.structure, (item) => {
      if (linkedIds && !item.isLinked && isValidLinkedElement(item)) {
        item.isLinked = linkedIds.includes(item.id);
      }

      if (style?.config.framework) {
        const { framework } = style.config;
        const { min, max } = item.template?.framework || {};

        if (
          (min && compareVersion(framework, min) > 0) ||
          (max && compareVersion(framework, max) < 1)
        ) {
          let parent = item.parent;

          while (parent && !parent.isOutdated) {
            parent.isOutdated = true;
            parent.forAlertIcon = false;
            parent = parent.parent;
          }

          item.forAlertIcon = true;
          item.isOutdated = true;
        }
      }
    });
  }

  if (type === RENAME_ELEMENT_SUCCESS && "meta" in action) {
    const template = action.meta;

    if (templates?.templates) {
      state.course.element.templates = {
        ...templates,
        templates: updateObject(templates.templates, "id", template?.id, { name: template?.name }),
      };
    }

    if (elmProperties && elmProperties[template?.id]) {
      state.course.element.properties = {
        ...elmProperties,
        [template?.id]: { ...elmProperties[template?.id], name: template?.name },
      };
    }
  }

  return state;
};

export default crossSliceReducer;
