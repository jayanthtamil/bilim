import { Dispatch } from "react";

import {
  ButtonComponent,
  ComponentStyle,
  ContentTemplate,
  CourseElementTemplate,
  MediaComponent,
  MediaFile,
  RepeaterComponent,
  SoundComponent,
  TextComponent,
} from "types";

export interface ContentEditorState {
  isEdited: boolean;
  template: CourseElementTemplate | null;
  data: ContentTemplate | null;
  oldMedias: MediaFile[];
  component?: MediaComponent | ButtonComponent | SoundComponent;
}

export const SET_COMPONENT = "SET_COMPONENT";
export const INIT_CONTENT_EDITOR_DATA = "INIT_CONTENT_EDITOR_DATA";
export const UPDATE_TEXT_COMPONENT = "UPDATE_TEXT_COMPONENT";
export const UPDATE_MEDIA_COMPONENT = "UPDATE_MEDIA_COMPONENT";
export const UPDATE_BUTTON_COMPONENT = "UPDATE_BUTTON_COMPONENT";
export const UPDATE_SOUND_COMPONENT = "UPDATE_SOUND_COMPONENT";
export const UPDATE_REPEATER_COMPONENT = "UPDATE_REPEATER_COMPONENT";
export const APPLY_COMPONENT_STYLE = "APPLY_COMPONENT_STYLE";
export const SET_VALIDATION = "SET_VALIDATION";
export const UPDATE_360_MEDIA_OPTION = "UPDATE_MEDIA_360_OPTION";

export type SetComponentAction = {
  type: typeof SET_COMPONENT;
  payload: MediaComponent | ButtonComponent | SoundComponent | undefined;
};

export type InitContentEditorAction = {
  type: typeof INIT_CONTENT_EDITOR_DATA;
  payload: { template: CourseElementTemplate; data: ContentTemplate };
};

export type UpdateTextComponentAction = {
  type: typeof UPDATE_TEXT_COMPONENT;
  payload: TextComponent;
};

export type UpdateMediaComponentAction = {
  type: typeof UPDATE_MEDIA_COMPONENT;
  payload: MediaComponent;
};

export type UpdateMedia360ptionAction = {
  type: typeof UPDATE_360_MEDIA_OPTION;
  payload: MediaComponent;
}

export type UpdateButtonComponentAction = {
  type: typeof UPDATE_BUTTON_COMPONENT;
  payload: ButtonComponent;
};

export type UpdateSoundComponentAction = {
  type: typeof UPDATE_SOUND_COMPONENT;
  payload: SoundComponent;
};

export type UpdateRepeaterComponentAction = {
  type: typeof UPDATE_REPEATER_COMPONENT;
  payload: RepeaterComponent;
};

export type ApplyComponentStyleAction = {
  type: typeof APPLY_COMPONENT_STYLE;
  payload: {
    styleName?: string;
    style?: ComponentStyle;
  };
};

export type ContentEditorActions =
  | SetComponentAction
  | InitContentEditorAction
  | UpdateTextComponentAction
  | UpdateMediaComponentAction
  | UpdateMedia360ptionAction
  | UpdateButtonComponentAction
  | UpdateSoundComponentAction
  | UpdateRepeaterComponentAction
  | ApplyComponentStyleAction;

export type ContentEditorDispatch = Dispatch<ContentEditorActions>;
