import {
  CourseElementTemplate,
  ContentTemplateAction,
  TemplateBackgroundAction,
  TemplateSimpleContentJSON,
  TemplateBackgroundJSON,
  TemplateSoundJSON,
  TemplateEditorOptionsJSON,
  MediaFile,
  BackgroundMedia,
  TemplateEditorBackgroundJSON,
  TempalteActionView,
  TemplateBackgroundSoundAction,
} from "types";
import { BackgroundOption2Types, BackgroundOptionTypes } from "editor-constants";
import { fromRgbaStr, getElementBySelector, toJSONObject } from "utils";

export const getTemplateActionModel = (
  template: CourseElementTemplate,
  view: TempalteActionView
) => {
  const { options } = template;
  const rootElement = getElementBySelector(template.html, ".outercontainer");
  const editorOptions = toJSONObject<TemplateEditorOptionsJSON>(
    rootElement?.getAttribute("blm-editor-options")
  );

  const data = new ContentTemplateAction();
  const { load, complete } = data;
  const { onload, oncomplete } = options || {};
  const { onLoad, onComplete } = editorOptions || {};

  load.navigation.always = view.load.always
    ? onload?.always ?? view.load.always.default
    : undefined;
  load.navigation.next = onload?.hidenext ?? false;
  load.navigation.previous = onload?.hideprevious ?? false;
  load.navigation.home = onload?.hidehome ?? false;
  load.simpleContent = createSimpleContent(
    onload?.opensimplecontent,
    false,
    view.load.simpleContent
  );
  load.background = createBackground(
    onload?.changebackground,
    onLoad?.background,
    true,
    view.load.background
  );
  load.sound = createLoadSound(
    onload?.playsound,
    onload?.stopsound,
    onLoad?.sound,
    true,
    view.load.sound
  );
  load.backgroundSound = createBackgroundSound(
    onload?.playbackgroundsound,
    onload?.stopbackgroundsound,
    onLoad?.backgroundsounds,
    true,
    view.load.backgroundSound
  );

  complete.navigation.next = oncomplete?.keepnextkidden ?? false;
  complete.navigation.previous = oncomplete?.showprevious ?? false;
  complete.navigation.home = oncomplete?.showhome ?? false;
  complete.simpleContent = createSimpleContent(
    oncomplete?.opensimplecontent,
    undefined,
    view.complete?.simpleContent
  );
  complete.background = createBackground(
    oncomplete?.changebackground,
    onComplete?.background,
    undefined,
    view.complete?.background
  );
  complete.sound = createSound(
    oncomplete?.playsound,
    onComplete?.sound,
    undefined,
    view.complete?.sound
  );
  return data;
};

const createSimpleContent = (
  obj?: TemplateSimpleContentJSON,
  defAlways?: boolean,
  hasAlways = false
) => {
  const { checked = false, always = defAlways, id: simpleContentId, option, display } = obj || {};

  return { checked, always: hasAlways ? always : undefined, simpleContentId, option, display };
};

const createBackground = (
  obj?: TemplateBackgroundJSON,
  editorObj?: TemplateEditorBackgroundJSON,
  defAlways?: boolean,
  hasAlways = false
) => {
  const {
    checked = false,
    always = defAlways,
    tint,
    option1,
    option2,
    parallaxe,
    loop,
    restore,
  } = obj || {};
  const { main, webm, image } = editorObj || {};
  const result: TemplateBackgroundAction = {
    checked,
    always: hasAlways ? always : undefined,
  };

  if (main) {
    const background = new BackgroundMedia();

    background.main = main;
    background.webm = webm;
    background.image = image;
    background.restore = restore;

    if (tint) {
      background.tint = fromRgbaStr(tint);
    }

    if (option1) {
      background.option = option1 as BackgroundOptionTypes;

      if (background.option === BackgroundOptionTypes.Autoplay) {
        background.optionValue = loop ?? false;
      } else {
        background.optionValue = parallaxe || 0;
      }

      if (option2) {
        background.option2 = option2 as BackgroundOption2Types;
      }
    }

    result.background = background;
  }

  return result;
};

const createLoadSound = (
  obj?: TemplateSoundJSON,
  object?: TemplateSoundJSON,
  sound?: MediaFile,
  defAlways?: boolean,
  hasAlways = false
) => {
  const { checked = false, always = defAlways } = obj || {};

  return { checked, unChecked: object?.checked, always: hasAlways ? always : undefined, sound };
};

const createSound = (
  obj?: TemplateSoundJSON,
  sound?: MediaFile,
  defAlways?: boolean,
  hasAlways = false
) => {
  const { checked = false, always = defAlways } = obj || {};

  return { checked, always: hasAlways ? always : undefined, sound };
};

const createBackgroundSound = (
  obj?: TemplateBackgroundSoundAction,
  object?: TemplateBackgroundSoundAction,
  backgroundsounds?: MediaFile,
  defAlways?: boolean,
  hasAlways = false
) => {
  const { checked = false, always = defAlways } = obj || {};
  return {
    checked,
    unChecked: object?.checked,
    always: hasAlways ? always : undefined,
    backgroundsounds,
  };
};
