import { AccordionProps } from "@material-ui/core";

import { CourseElement, ContextMenu, OptionsClickHandler } from "types";
import { ContainerProps } from "./repository-panel-container";

export interface RepositoryProps extends ContainerProps {
  onOptionsClick?: OptionsClickHandler;
  onPanelChange?: AccordionProps["onChange"];
}

export interface RepositoryState {
  ctxData?: ContextMenu;
  ctxItem?: CourseElement;
}

export enum RepositoryActionTypes {
  ShowContextMenu = "SHOW_CONTEXT_MENU",
  HideContextMenu = "HIDE_CONTEXT_MENU",
}

export interface ShowContextMenuAction {
  type: RepositoryActionTypes.ShowContextMenu;
  data: ContextMenu;
}

export interface HideContextMenuAction {
  type: RepositoryActionTypes.HideContextMenu;
  data: undefined;
}

export const showContextMenu = (data: ContextMenu): ShowContextMenuAction => {
  return {
    type: RepositoryActionTypes.ShowContextMenu,
    data: data,
  };
};

export const hideContextMenu = (): HideContextMenuAction => {
  return {
    type: RepositoryActionTypes.HideContextMenu,
    data: undefined,
  };
};

export type RepositoryActions = ShowContextMenuAction | HideContextMenuAction;
