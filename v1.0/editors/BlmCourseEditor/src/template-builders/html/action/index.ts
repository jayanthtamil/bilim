import {
  TemplateOptionsJSON,
  CourseElementTemplate,
  ContentTemplateAction,
  TemplateSimpleContentAction,
  TemplateBackgroundAction,
  TemplateSoundAction,
  TemplateBackgroundJSON,
  TemplateEditorOptionsJSON,
  BackgroundMedia,
  TempalteActionView,
  TemplateBackgroundSoundAction,
} from "types";
import { BackgroundOptionTypes } from "editor-constants";
import {
  getElementBySelector,
  isImage,
  toggleAttributeInString,
  toJSONObject,
  toJSONString,
  createRGBA,
} from "utils";

export const setTemplateActionHTML = (
  template: CourseElementTemplate,
  data: ContentTemplateAction,
  view: TempalteActionView
): [string, TemplateOptionsJSON | null] => {
  const { html, options } = template;
  const rootElement = getElementBySelector(html, ".outercontainer");

  if (rootElement) {
        const options = createOptions(data, template?.options, view);
            const editorOptions = createEditorOptions(
      data,
      toJSONObject(rootElement.getAttribute("blm-editor-options")),
      view
    );
    const attrs = {
      "blm-options": toJSONString(options),
      "blm-editor-options": toJSONString(editorOptions) ?? undefined,
    };

    return [toggleAttributeInString(html, attrs, ".outercontainer"), options];
  }

  return [html, options];
};

const createSimpleContent = (action: TemplateSimpleContentAction) => {
  const { checked, always, simpleContentId: id, option, display } = action;

  return { checked: id ? checked : false, always, id, option, display };
};

const createBackground = (action: TemplateBackgroundAction) => {
  const { checked, always, background } = action;
  const result: TemplateBackgroundJSON = { checked: background?.main ? checked : false, always };

  if (background) {
    const { main, webm, image, tint, option, optionValue, option2, restore = false } = background;

    if (main) {
      result.path = main.url;
      result.tint = createRGBA(tint.color, tint.alpha);
      result.option1 = option;
      result.restore = restore;

      if (isImage(main.type)) {
        result.parallaxe =
          option === BackgroundOptionTypes.Parallax ? (optionValue as number) : undefined;
        result.option2 = option2;
      } else {
        result.pathwebm = webm?.url;
        result.paththumbnaill = image?.url;
        result.loop = Boolean(optionValue);
      }
    }
  }

  return result;
};

const createSound = (action: TemplateSoundAction) => {
  const { checked, always, sound } = action;

  return {
    checked: sound ? checked : false,
    always,
    path: sound?.url,
    subtitle: sound?.subtitle?.url,
    marker: sound?.marker?.url,
  };
};

const createLoadSound = (action: TemplateSoundAction) => {
  const { checked, always, sound } = action;

  return {
    checked: sound ? checked : false,
    always,
    path: sound?.url,
    subtitle: sound?.subtitle?.url,
    marker: sound?.marker?.url,
  };
};

const createSoundBackground = (action: TemplateBackgroundSoundAction) => {
  const { checked, always, backgroundsounds } = action;
  return {
    checked: backgroundsounds ? checked : false,
    always,
    path: backgroundsounds?.url,
    subtitle: backgroundsounds?.subtitle?.url,
    marker: backgroundsounds?.marker?.url,
  };
};

const stopSound = (action: TemplateSoundAction) => {
  const { always, unChecked } = action;
  return {
    checked: unChecked ?? false,
    always,
  };
};

const createOptions = (
  data: ContentTemplateAction,
  options: TemplateOptionsJSON | null,
  view: TempalteActionView
) => {
  const { load, complete } = data;
  const newOptions = {
    ...options,
    onload: {},
    oncomplete: view.complete ? {} : undefined,
  } as TemplateOptionsJSON;
  const { onload, oncomplete } = newOptions;
  
  if (onload) {
    if (view.load.navigation) {
      onload.always = load.navigation.always;
      onload.hidenext = load.navigation.next;
      onload.hideprevious = load.navigation.previous;
      onload.hidehome = load.navigation.home;
    }

    if (view.load.background) {
      onload.changebackground = createBackground(load.background);
    }

    if (view.load.simpleContent) {
      onload.opensimplecontent = createSimpleContent(load.simpleContent);
    }

    if (view.load.sound) {
      onload.playsound = createLoadSound(load.sound);
    }

    if (view.load.sound && view.load.background && view.load.simpleContent) {
      onload.stopsound = stopSound(load.sound);
    }
    if (view.load.backgroundSound) {
      onload.playbackgroundsound = createSoundBackground(load.backgroundSound);
      onload.stopbackgroundsound = stopSound(load.backgroundSound);
    }
      }

  if (view && oncomplete) {
    if (view.complete?.navigation) {
      oncomplete.keepnextkidden = complete.navigation.next;
      oncomplete.showprevious = complete.navigation.previous;
      oncomplete.showhome = complete.navigation.home;
    }
    oncomplete.opensimplecontent = createSimpleContent(complete.simpleContent);
    oncomplete.changebackground = createBackground(complete.background);
    oncomplete.playsound = createSound(complete.sound);
  }

  return newOptions;
};

const createEditorOptions = (
  data: ContentTemplateAction,
  options: TemplateEditorOptionsJSON | null,
  view: TempalteActionView
) => {
  const { load, complete } = data;
  const { onLoad = {}, onComplete = {}, ...others } = options || {};
  const newOptions: TemplateEditorOptionsJSON = { ...others };

  if (view.load.background) {
    onLoad.background = createEditorBackground(load.background.background);
  }

  if (view.load.sound) {
    onLoad.sound = createEditorSound(load.sound);
  }

  if (view.load.backgroundSound) {
    onLoad.backgroundsounds = createEditorBackgroundSound(load.backgroundSound);
  }

  if (view.complete?.background) {
    onComplete.background = createEditorBackground(complete.background.background);
  }

  if (view.complete?.sound) {
    onComplete.sound = createEditorSound(complete.sound);
  }

  if (onLoad.background || onLoad.sound || onLoad.backgroundsounds) {
    newOptions.onLoad = onLoad;
  }

  if (onComplete.background || onComplete.sound) {
    newOptions.onComplete = onComplete;
  }

  return Object.keys(newOptions).length ? newOptions : null;
};

const createEditorBackground = (background?: BackgroundMedia) => {
  if (background?.main) {
    const { main, webm, image } = background;

    return isImage(main.type) ? { main } : { main, webm, image };
  }
};

const createEditorSound = (sound?: TemplateSoundAction) => {
  return sound?.sound;
};

const createEditorBackgroundSound = (sound?: TemplateBackgroundSoundAction) => {
  return sound?.backgroundsounds;
};
