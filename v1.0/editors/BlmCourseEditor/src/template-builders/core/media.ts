import {
  BackgroundMedia,
  ButtonComponent,
  ComponentAction,
  ContentTemplate,
  ContentTemplateAction,
  CourseElementProps,
  CourseElementTemplate,
  MediaComponent,
  MediaFile,
  PartPageBackground,
  QuestionTemplate,
  ScreenBackground,
  SoundComponent,
} from "types";
import { ElementType } from "editor-constants";
import {
  filterFalsy,
  getRepeaterComponents,
  isDocumentAction,
  isMediaButton,
  isMediaCustom,
  isMediaHotspot,
  isMediaHotspot360,
  isMediaImage,
  isMediaSlideshow,
  isMediaStandardVideo,
  isMediaSynchroVideo,
  isPopoverAction,
  isQuestionCustom,
  isQuestionPropositions,
  isReplaceBackgroundAction,
  isVideo,
  isMediaFlipCard,
} from "utils";
import {
  getContentTemplateModel,
  getPartPageBackgroundModel,
  getQuestionTemplateModel,
  getScreenBackgroundModel,
  getTemplateActionModel,
} from "../model";

export function getAllMedias(template: CourseElementTemplate) {
  const result: MediaFile[] = [];

  if (
    template.templateType === ElementType.Screen ||
    template.templateType === ElementType.Question ||
    template.templateType === ElementType.SimpleContent
  ) {
    const background = getScreenBackgroundModel(template);

    if (background) {
      result.push(...getScreenBackgroundMedias(background));
    }
  } else {
    const background = getPartPageBackgroundModel(template);

    if (background) {
      result.push(...getPartPageBackgroundMedias(background));
    }
  }

  if (template.templateType === ElementType.Question) {
    const question = getQuestionTemplateModel(template);

    result.push(...getQuestionMedias(question));
  } else {
    const content = getContentTemplateModel(template);

    result.push(...getContentMedias(content));
  }

  const action = getTemplateActionModel(template, {
    dashboardType: "standard",
    load: { simpleContent: true, background: true, sound: true, backgroundSound: true },
    complete: { simpleContent: true, background: true, sound: true },
  });

  result.push(...getTemplateActionMedias(action));

  return filterFalsy(result);
}

export function getPartPageBackgroundMedias(background: PartPageBackground) {
  const { media } = background;
  const result: (MediaFile | undefined)[] = [];

  result.push(...getBackgroundMedias(media));

  return filterFalsy(result);
}

export function getScreenBackgroundMedias(background: ScreenBackground) {
  const { media } = background;
  const result: (MediaFile | undefined)[] = [];

  result.push(...getBackgroundMedias(media));

  return filterFalsy(result);
}

function getBackgroundMedias(background?: BackgroundMedia) {
  const result = [];

  if (background) {
    if (background.main && isVideo(background.main.type)) {
      result.push(background.main, background.webm, background.image);
    } else {
      result.push(background.main);
    }
  }

  return filterFalsy(result);
}

export function getContentMedias(content: ContentTemplate) {
  const { medias, buttons, sounds, repeater } = content;
  const arr1: MediaComponent[] = [...medias, ...getRepeaterComponents(repeater?.medias)];
  const arr2: ButtonComponent[] = [...buttons, ...getRepeaterComponents(repeater?.buttons)];
  const arr3: SoundComponent[] = [...sounds, ...getRepeaterComponents(repeater?.sounds)];
  const result: (MediaFile | undefined)[] = [];

  arr1.forEach((media) => {
    if (isMediaImage(media) && media.value.media) {
      result.push(media.value.media);
    } else if (isMediaFlipCard(media) && media.value) {
      result.push(media.value.recto.media);
    } else if (isMediaSlideshow(media)) {
      media.value.items.forEach((item) => {
        result.push(item.media);
      });
    } else if (isMediaButton(media)) {
      const button = media.value;

      result.push(button.click, button.over, button.out, button.icon);
      result.push(...getActionMedias(button.clickAction));
      result.push(...getActionMedias(button.overAction));
    } else if (isMediaCustom(media)) {
      result.push(media.value.media);
    } else if (isMediaStandardVideo(media)) {
      const standard = media.value;

      result.push(
        standard.main,
        standard.webm,
        standard.image,
        standard.main?.subtitle,
        standard.main?.marker
      );
    } else if (isMediaSynchroVideo(media)) {
      const synchro = media.value;

      result.push(synchro.main, synchro.webm);
    } else if (isMediaHotspot(media)) {
      const hotspot = media.value;

      result.push(hotspot.media);

      hotspot.items.forEach((item) => {
        result.push(...getActionMedias(item.clickAction));
        result.push(...getActionMedias(item.overAction));
      });
    } else if (isMediaHotspot360(media)) {
      media.value.items.forEach((item) => {
        result.push(item.media);

        item.items.forEach((item2) => {
          result.push(...getActionMedias(item2.clickAction));
          result.push(...getActionMedias(item2.overAction));
        });
      });
    }
  });

  arr2.forEach((button) => {
    const btn = button.value;

    result.push(btn.background, btn.inline);
    result.push(...getActionMedias(btn.clickAction));
    result.push(...getActionMedias(btn.overAction));
  });

  arr3.forEach((sound) => {
    const snd = sound.value;

    result.push(snd.media, snd.image, snd.media?.subtitle, snd.media?.marker);
  });

  return filterFalsy(result);
}

function getActionMedias(action: ComponentAction) {
  const result: (MediaFile | undefined)[] = [];

  if (action) {
    if (isDocumentAction(action)) {
      result.push(action.value?.document);
    } else if (isReplaceBackgroundAction(action)) {
      result.push(action.value?.background);
    } else if (isPopoverAction(action)) {
      result.push(action.value?.media);
    }
  }

  return filterFalsy(result);
}

export function getQuestionMedias(question: QuestionTemplate) {
  const {
    introduction: {
      media: { media, sound },
    },
    main: { media: mMedia, sound: mSound, content: mContent },
    feedback: {
      global: {
        right: { media: rMedia, sound: rSound },
        wrong: { media: wMedia, sound: wSound },
      },
    },
  } = question;
  const result: (MediaFile | undefined)[] = [];

  result.push(media.value, sound.value);
  result.push(mMedia.value?.media!, mSound.value);
  result.push(rMedia.value, rSound.value, wMedia.value, wSound.value);

  if (isQuestionPropositions(mContent)) {
    mContent.value?.items.map((proposition) => {
      const {
        media,
        sound,
        feedback: { media: fbMedia, sound: fbSound },
      } = proposition;

      result.push(media.value, sound.value, fbMedia.value, fbSound.value);
    });
  } else if (isQuestionCustom(mContent)) {
    result.push(mContent.value);
  }

  return filterFalsy(result);
}

export function getTemplateActionMedias(action: ContentTemplateAction) {
  const result: (MediaFile | undefined)[] = [];

  if (action) {
    result.push(
      ...getBackgroundMedias(action.load.background.background),
      action.load.sound.sound,
      action.load.sound.sound?.subtitle,
      action.load.sound.sound?.marker,
      ...getBackgroundMedias(action.complete.background.background),
      action.complete.sound.sound,
      action.complete.sound.sound?.subtitle,
      action.complete.sound.sound?.marker
    );
  }

  return filterFalsy(result);
}

export function getPropertiesMedias(properties: CourseElementProps) {
  const result: (MediaFile | undefined | null)[] = [];

  if (properties.mediaJSON) {
    result.push(
      properties.mediaJSON.default,
      properties.mediaJSON.over,
      properties.mediaJSON.overSound
    );
  }

  if (properties.navigationJSON) {
    result.push(...Object.values(properties.navigationJSON));
  }

  if (properties.backgroundJSON) {
    result.push(...getBackgroundMedias(properties.backgroundJSON.media));
  }

  return filterFalsy(result);
}
