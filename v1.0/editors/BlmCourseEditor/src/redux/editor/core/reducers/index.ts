import { TemplateDisplayTypes, TemplateOrientationTypes } from "editor-constants";
import * as actions from "../types";

export const initState: actions.EditorCoreState = {
  isInteractable: true,
  tree: { item: undefined, node: undefined, action: undefined },
  element: undefined,
  courseProps: undefined,
  elementProps: undefined,
  structurePanel: { open: false, anchorEle: undefined, isPinned: false },
  propertiesPanel: { open: false, tabIndex: -1 },
  templatesPanel: {
    open: false,
    display: TemplateDisplayTypes.Desktop,
    orientation: TemplateOrientationTypes.Portrait,
  },
};

export default function elementReducer(
  state = initState,
  action: actions.ElementPropActions
): actions.EditorCoreState {
  switch (action.type) {
    case actions.SET_COURSE_PROPERTIES:
      return {
        ...state,
        courseProps: action.payload.properties,
      };
    case actions.SET_ELEMENT_PROPERTIES:
      return {
        ...state,
        elementProps: action.payload.properties,
      };
    case actions.TOGGLE_INTERACTION:
      return {
        ...state,
        isInteractable: action.payload,
      };
    case actions.TOGGLE_STRUCTURE_PANEL:
      const { open = !state.structurePanel.open } = action.payload;

      return {
        ...state,
        structurePanel: {
          ...state.structurePanel,
          open,
        },
      };
    case actions.TOGGLE_STRUCTURE_PANEL_PIN:
      const { isPinned = !state.structurePanel.isPinned } = action.payload;

      return {
        ...state,
        structurePanel: {
          ...state.structurePanel,
          isPinned,
          open: isPinned ? true : state.structurePanel.open,
        },
      };
    case actions.TOGGLE_ELEMENT_PROPERTIES_PANEL:
      return {
        ...state,
        element: action.payload.element && { ...action.payload.element },
        propertiesPanel: {
          ...state.propertiesPanel,
          open: action.payload.open,
        },
      };
    case actions.TOGGLE_ELEMENT_TEMPLATES_PANEL:
      return {
        ...state,
        element: action.payload.element && { ...action.payload.element },
        templatesPanel: {
          ...state.templatesPanel,
          open: action.payload.open,
          child: action.payload.child && { ...action.payload.child },
        },
      };
    case actions.SET_STRUCTURE_ANCHOR_ELE:
      const { element } = action.payload;

      return {
        ...state,
        structurePanel: { ...state.structurePanel, anchorEle: element },
      };
    case actions.SELECT_TREE_ITEM:
      const { item, node } = action.payload;

      return {
        ...state,
        tree: {
          ...state.tree,
          item: item && { ...item },
          node: node,
        },
      };
    case actions.SET_TREE_ACTION:
      return {
        ...state,
        tree: {
          ...state.tree,
          action: action.payload,
        },
      };
    case actions.SET_ELEMENT_PROPERTIES_TAB_INDEX:
      return {
        ...state,
        propertiesPanel: {
          ...state.propertiesPanel,
          tabIndex: action.payload.index,
        },
      };
    case actions.SET_TEMPLATE_VIEW:
      return {
        ...state,
        templatesPanel: {
          ...state.templatesPanel,
          display: action.payload.display,
          orientation: action.payload.orientation || state.templatesPanel.orientation,
        },
      };
    case actions.SET_PREVIEW_TEMPLATES:
      return {
        ...state,
        templatesPanel: {
          ...state.templatesPanel,
          templates: action.payload.templates,
        },
      };
    default:
      return state;
  }
}
