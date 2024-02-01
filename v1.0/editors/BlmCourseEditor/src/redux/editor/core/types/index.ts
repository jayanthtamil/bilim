import {
  CourseElement,
  CourseElementProps,
  CourseElementTemplate,
  CourseProps,
  TreeAction,
} from "types";
import { TemplateDisplayTypes, TemplateOrientationTypes } from "editor-constants";

export interface EditorCoreState {
  isInteractable: boolean;
  tree: { item?: CourseElement; node?: HTMLElement; action?: TreeAction };
  element?: CourseElement;
  courseProps?: CourseProps;
  elementProps?: CourseElementProps;
  structurePanel: { isPinned: boolean; open: boolean; anchorEle?: HTMLElement };
  propertiesPanel: {
    open: boolean;
    tabIndex: number;
  };
  templatesPanel: {
    open: boolean;
    child?: CourseElement;
    templates?: CourseElementTemplate[];
    display: TemplateDisplayTypes;
    orientation: TemplateOrientationTypes;
  };
}

export const SET_COURSE_PROPERTIES = "SET_COURSE_PROPERTIES";
export const SET_ELEMENT_PROPERTIES = "SET_ELEMENT_PROPERTIES";

export const TOGGLE_INTERACTION = "TOGGLE_INTERACTION";
export const TOGGLE_STRUCTURE_PANEL = "TOGGLE_STRUCTURE_PANEL";
export const TOGGLE_STRUCTURE_PANEL_PIN = "TOGGLE_STRUCTURE_PANEL_PIN";
export const TOGGLE_ELEMENT_PROPERTIES_PANEL = "TOGGLE_ELEMENT_PROPERTIES_PANEL";
export const TOGGLE_ELEMENT_TEMPLATES_PANEL = "TOGGLE_ELEMENT_TEMPLATES_PANEL";

export const SET_STRUCTURE_ANCHOR_ELE = "SET_STRUCTURE_ANCHOR_ELE";
export const SELECT_TREE_ITEM = "SELECT_TREE_ITEM";
export const SET_TREE_ACTION = "SET_TREE_ACTION";
export const SET_ELEMENT_PROPERTIES_TAB_INDEX = "SET_ELEMENT_PROPERTIES_TAB_INDEX";
export const SET_TEMPLATE_VIEW = "SET_TEMPLATE_VIEW";
export const SET_PREVIEW_TEMPLATES = "SET_PREVIEW_TEMPLATES";

export interface SetCoursePropertiesAction {
  type: typeof SET_COURSE_PROPERTIES;
  payload: { properties?: CourseProps };
}

export interface SetElementPropertiesAction {
  type: typeof SET_ELEMENT_PROPERTIES;
  payload: { properties?: CourseElementProps };
}

export interface ToggleStructurePanelAction {
  type: typeof TOGGLE_STRUCTURE_PANEL;
  payload: { open?: boolean };
}

export interface ToggleStructurePanelPinAction {
  type: typeof TOGGLE_STRUCTURE_PANEL_PIN;
  payload: { isPinned?: boolean };
}

export interface ToggleInteractionAction {
  type: typeof TOGGLE_INTERACTION;
  payload: boolean;
}

export interface ToggleElementPropertiesPanelAction {
  type: typeof TOGGLE_ELEMENT_PROPERTIES_PANEL;
  payload: { open: boolean; element?: CourseElement };
}

export interface ToggleElementTemplatesPanelAction {
  type: typeof TOGGLE_ELEMENT_TEMPLATES_PANEL;
  payload: { open: boolean; element?: CourseElement; child?: CourseElement };
}

export interface SetStructureAnchorEleAction {
  type: typeof SET_STRUCTURE_ANCHOR_ELE;
  payload: { element: HTMLElement };
}

export interface SelectTreeItemAction {
  type: typeof SELECT_TREE_ITEM;
  payload: { item?: CourseElement; node?: HTMLElement };
}

export interface SetTreeAction {
  type: typeof SET_TREE_ACTION;
  payload?: TreeAction;
}

export interface SetElementPropertiesPanelTabIndexAction {
  type: typeof SET_ELEMENT_PROPERTIES_TAB_INDEX;
  payload: {
    index: number;
  };
}

export interface SetTemplateView {
  type: typeof SET_TEMPLATE_VIEW;
  payload: {
    display: TemplateDisplayTypes;
    orientation?: TemplateOrientationTypes;
  };
}

export interface SetPreviewTemplates {
  type: typeof SET_PREVIEW_TEMPLATES;
  payload: {
    templates?: CourseElementTemplate[];
  };
}

export type ElementPropActions =
  | SetCoursePropertiesAction
  | SetElementPropertiesAction
  | ToggleInteractionAction
  | ToggleStructurePanelAction
  | ToggleStructurePanelPinAction
  | ToggleElementPropertiesPanelAction
  | ToggleElementTemplatesPanelAction
  | SetStructureAnchorEleAction
  | SelectTreeItemAction
  | SetTreeAction
  | SetElementPropertiesPanelTabIndexAction
  | SetTemplateView
  | SetPreviewTemplates;
