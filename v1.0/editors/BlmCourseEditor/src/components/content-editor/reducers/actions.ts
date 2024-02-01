import {
  ButtonComponent,
  ComponentStyle,
  ContentTemplate,
  CourseElementTemplate,
  MediaComponent,
  RepeaterComponent,
  SoundComponent,
  TextComponent,
} from "types";
import * as types from "./types";

export function setComponent(
  component?: MediaComponent | ButtonComponent | SoundComponent
): types.SetComponentAction {
  return {
    type: types.SET_COMPONENT,
    payload: component,
  };
}

export function initContentEditor(
  template: CourseElementTemplate,
  data: ContentTemplate
): types.InitContentEditorAction {
  return {
    type: types.INIT_CONTENT_EDITOR_DATA,
    payload: { template, data },
  };
}

export function updateTextComponent(component: TextComponent): types.UpdateTextComponentAction {
  return {
    type: types.UPDATE_TEXT_COMPONENT,
    payload: component,
  };
}

export function updateMediaComponent(component: MediaComponent): types.UpdateMediaComponentAction {
  return {
    type: types.UPDATE_MEDIA_COMPONENT,
    payload: component,
  };
}

export function updateMedia360Option(component: MediaComponent): types.UpdateMedia360ptionAction {
  return {
    type: types.UPDATE_360_MEDIA_OPTION,
    payload: component,
  };
}

export function updateButtonComponent(
  component: ButtonComponent
): types.UpdateButtonComponentAction {
  return {
    type: types.UPDATE_BUTTON_COMPONENT,
    payload: component,
  };
}

export function updateSoundComponent(component: SoundComponent): types.UpdateSoundComponentAction {
  return {
    type: types.UPDATE_SOUND_COMPONENT,
    payload: component,
  };
}

export function updateRepeaterComponent(
  repeater: RepeaterComponent
): types.UpdateRepeaterComponentAction {
  return {
    type: types.UPDATE_REPEATER_COMPONENT,
    payload: repeater,
  };
}

export function applyComponentStyle(
  styleName?: string,
  style?: ComponentStyle
): types.ApplyComponentStyleAction {
  return {
    type: types.APPLY_COMPONENT_STYLE,
    payload: { styleName, style },
  };
}
