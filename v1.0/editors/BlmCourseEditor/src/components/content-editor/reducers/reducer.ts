import {
  ButtonComponent,
  MediaComponent,
  MediaRepeaterComponent,
  RepeaterComponent,
  SoundComponent,
  TextComponent,
} from "types";
import {
  isButtonRepeater,
  isMediaRepeater,
  isMediaComponent,
  isButtonComponent,
  isSoundRepeater,
  isSoundComponent,
} from "utils";
import { getContentMedias } from "template-builders";
import {
  initializeButton,
  initializeMedia,
  initializeSound,
  mapRepeaters,
  applyMediaComponetStyles,
  applyButtonComponetStyles,
  applySoundComponetStyles,
  initializeRepeater,
} from "./utils";
import * as Types from "./types";

export default function contentReducer(
  state: Types.ContentEditorState,
  action: Types.ContentEditorActions
): Types.ContentEditorState {
  const { template, data } = state;
  let { component } = state;

  const setCurrentComponent = (newComponent: MediaComponent | ButtonComponent | SoundComponent) => {
    if (component && newComponent.id === component.id) {
      component = newComponent;
    }
  };

  if (action.type === Types.SET_COMPONENT) {
    return { ...state, component: action.payload };
  } else if (action.type === Types.INIT_CONTENT_EDITOR_DATA) {
    const { template, data } = action.payload;

    return {
      ...state,
      isEdited: false,
      template,
      data,
      oldMedias: getContentMedias(data),
    };
  } else if (data && template) {
    const newData = { ...data };

    if (action.type === Types.UPDATE_TEXT_COMPONENT) {
      const { texts } = newData;
      const newText: TextComponent = { ...action.payload, isEdited: true };

      newData.texts = texts.map((text) => (text.id === newText.id ? newText : text));
    } else if (action.type === Types.UPDATE_MEDIA_COMPONENT) {
      const newMedia = initializeMedia(action.payload, template);
      const callback = (media: MediaComponent) => (media.id === newMedia.id ? newMedia : media);

      if (newMedia.repeaterId) {
        newData.repeater.medias = mapRepeaters(
          newData.repeater.medias,
          newMedia.repeaterId!,
          callback
        ) as MediaRepeaterComponent[];
      } else {
        newData.medias = newData.medias.map(callback);
      }

      setCurrentComponent(newMedia);
    } else if (action.type === Types.UPDATE_360_MEDIA_OPTION) {
      const newMedia = initializeMedia(action.payload, template);
      const callback = (media: MediaComponent) => (media.id === newMedia.id ? newMedia : media);
      newData.medias = newData.medias.map(callback);
      setCurrentComponent(newMedia);
    } else if (action.type === Types.UPDATE_BUTTON_COMPONENT) {
      const newButton = initializeButton(action.payload);
      const callback = (button: ButtonComponent) =>
        button.id === newButton.id ? newButton : button;

      if (newButton.repeaterId) {
        newData.repeater.buttons = mapRepeaters(
          newData.repeater.buttons,
          newButton.repeaterId,
          callback
        );
      } else {
        newData.buttons = newData.buttons.map(callback);
      }

      setCurrentComponent(newButton);
    } else if (action.type === Types.UPDATE_SOUND_COMPONENT) {
      const newSound = initializeSound(action.payload);
      const callback = (sound: SoundComponent) => (sound.id === newSound.id ? newSound : sound);

      if (newSound.repeaterId) {
        newData.repeater.sounds = mapRepeaters(
          newData.repeater.sounds,
          newSound.repeaterId,
          callback
        );
      } else {
        newData.sounds = newData.sounds.map(callback);
      }

      setCurrentComponent(newSound);
    } else if (action.type === Types.UPDATE_REPEATER_COMPONENT) {
      const newRepeater = initializeRepeater(action.payload);
      const callback = <T>(repeater: RepeaterComponent<T>) =>
        repeater.id === newRepeater.id
          ? (newRepeater as unknown as RepeaterComponent<T>)
          : repeater;

      if (isMediaRepeater(newRepeater) && newData.repeater.medias) {
        newData.repeater.medias = newData.repeater.medias.map(callback) as MediaRepeaterComponent[];
      } else if (isButtonRepeater(newRepeater) && newData.repeater.buttons) {
        newData.repeater.buttons = newData.repeater.buttons.map(callback);
      } else if (isSoundRepeater(newRepeater) && newData.repeater.sounds) {
        newData.repeater.sounds = newData.repeater.sounds.map(callback);
      }
    } else if (action.type === Types.APPLY_COMPONENT_STYLE && component) {
      const { styleName, style } = action.payload;

      if (isMediaComponent(component)) {
        const mediaCallback = (media: MediaComponent) => {
          const newMedia = applyMediaComponetStyles(
            media,
            component as MediaComponent,
            template,
            styleName,
            style
          );

          setCurrentComponent(newMedia);
          return newMedia;
        };

        if (component && component.repeaterId) {
          newData.repeater.medias = mapRepeaters(
            newData.repeater.medias,
            component.repeaterId,
            mediaCallback
          ) as MediaRepeaterComponent[];
        } else {
          newData.medias = newData.medias.map(mediaCallback);
        }
      } else if (isButtonComponent(component) && styleName) {
        const buttonCallback = (button: ButtonComponent) => {
          const newButton = applyButtonComponetStyles(button, styleName, (component as ButtonComponent).buttonOptions, style);

          setCurrentComponent(newButton);
          return newButton;
        };

        if (component && component.repeaterId) {
          newData.repeater.buttons = mapRepeaters(
            newData.repeater.buttons,
            component.repeaterId,
            buttonCallback
          );
        } else {
          newData.buttons = newData.buttons.map(buttonCallback);
        }
      } else if (isSoundComponent(component) && styleName) {
        const soundCallback = (sound: SoundComponent) => {
          const newSound = applySoundComponetStyles(sound, styleName, style);

          setCurrentComponent(newSound);
          return newSound;
        };

        if (component && component.repeaterId) {
          newData.repeater.sounds = mapRepeaters(
            newData.repeater.sounds,
            component.repeaterId,
            soundCallback
          );
        } else {
          newData.sounds = newData.sounds.map(soundCallback);
        }
      }
    }

    return {
      ...state,
      isEdited: true,
      data: newData,
      component,
    };
  }

  return state;
}
