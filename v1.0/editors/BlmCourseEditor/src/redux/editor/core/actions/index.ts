import {
  CourseElement,
  CourseElementProps,
  CourseElementTemplate,
  CourseProps,
  TreeAction,
} from "types";
import { TemplateDisplayTypes, TemplateOrientationTypes } from "editor-constants";
import { findIndex } from "utils";
import { AppThunkAction } from "redux/types";
import * as actions from "../types";

export function setCourseProperties(properties?: CourseProps): actions.SetCoursePropertiesAction {
  return {
    type: actions.SET_COURSE_PROPERTIES,
    payload: { properties },
  };
}

export function setElementProperties(
  properties?: CourseElementProps
): actions.SetElementPropertiesAction {
  return {
    type: actions.SET_ELEMENT_PROPERTIES,
    payload: { properties },
  };
}

export function toggleInteraction(enable: boolean): actions.ToggleInteractionAction {
  return {
    type: actions.TOGGLE_INTERACTION,
    payload: enable,
  };
}

export function openStructurePanel() {
  return toggleStructurePanel(true);
}

export function closeStructurePanel() {
  return toggleStructurePanel(false);
}

export function toggleStructurePanel(open?: boolean): actions.ToggleStructurePanelAction {
  return {
    type: actions.TOGGLE_STRUCTURE_PANEL,
    payload: { open },
  };
}

export function toggleStructurePanelPin(isPinned?: boolean): actions.ToggleStructurePanelPinAction {
  return {
    type: actions.TOGGLE_STRUCTURE_PANEL_PIN,
    payload: { isPinned },
  };
}

export function openElementPropertiesPanel(element: CourseElement) {
  return toggleElementPropertiesPanel(true, element);
}

export function closeElementPropertiesPanel() {
  return toggleElementPropertiesPanel(false);
}

export function toggleElementPropertiesPanel(
  open: boolean,
  element?: CourseElement
): actions.ToggleElementPropertiesPanelAction {
  return {
    type: actions.TOGGLE_ELEMENT_PROPERTIES_PANEL,
    payload: { open, element },
  };
}

export function openElementTemplatesPanel(element: CourseElement, child?: CourseElement) {
  return toggleElementTemplatesPanel(true, element, child);
}

export function closeElementTemplatesPanel() {
  return toggleElementTemplatesPanel(false);
}

export function toggleElementTemplatesPanel(
  open: boolean,
  element?: CourseElement,
  child?: CourseElement
): actions.ToggleElementTemplatesPanelAction {
  return {
    type: actions.TOGGLE_ELEMENT_TEMPLATES_PANEL,
    payload: { open, element, child },
  };
}

export function setStructureAnchorEle(element: HTMLElement): actions.SetStructureAnchorEleAction {
  return {
    type: actions.SET_STRUCTURE_ANCHOR_ELE,
    payload: { element: element },
  };
}

export function selectTreeItem(
  item?: CourseElement,
  node?: HTMLElement
): actions.SelectTreeItemAction {
  return {
    type: actions.SELECT_TREE_ITEM,
    payload: {
      item: item,
      node: node,
    },
  };
}

export const setTreeAction = (action?: TreeAction) => {
  return {
    type: actions.SET_TREE_ACTION,
    payload: action,
  };
};

export function setElementPropertiesTabIndex(
  index: number = -1
): actions.SetElementPropertiesPanelTabIndexAction {
  return {
    type: actions.SET_ELEMENT_PROPERTIES_TAB_INDEX,
    payload: { index },
  };
}

export function setTemplateView(
  display: TemplateDisplayTypes,
  orientation?: TemplateOrientationTypes
): actions.SetTemplateView {
  return {
    type: actions.SET_TEMPLATE_VIEW,
    payload: { display, orientation },
  };
}

export const previewTemplates =
  (
    template?: CourseElementTemplate | CourseElementTemplate[]
  ): AppThunkAction<actions.SetPreviewTemplates> =>
  (dispatch, getState) => {
    const {
      course: { element },
    } = getState();
    const templates = element.templates?.templates;
    let prevTemplates;

    if (Array.isArray(template)) {
      prevTemplates = template;
    } else if (template) {
      if (templates && templates.length !== 0) {
        const newTemplates = [...templates];
        const position = findIndex(newTemplates, template.id, "id");

        if (position !== -1) {
          newTemplates.splice(position, 1, template);

          prevTemplates = newTemplates;
        }
      }
    }

    return dispatch(setPreviewTemplates(prevTemplates));
  };

export const setPreviewTemplates = (
  templates?: CourseElementTemplate[]
): actions.SetPreviewTemplates => {
  return {
    type: actions.SET_PREVIEW_TEMPLATES,
    payload: { templates },
  };
};
