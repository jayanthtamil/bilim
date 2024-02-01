import isEmail from "validator/lib/isEmail";
import isURL from "validator/lib/isURL";
import i18next from "i18next";

import {
  ButtonComponent,
  ComponentAction,
  ComponentStyle,
  ContentTemplate,
  MediaComponent,
  MediaFormat,
  MediaHotspot,
  MediaHotspot360,
  MediaHotspotGroups,
  MediaHotspotItem,
  PopoverAction,
  SoundComponent,
  Tint,
} from "types";
import { ComponentActionTypes, GotoActionTypes } from "editor-constants";
import { GlTemplateBuilderStore } from "template-builders";
import {
  isGotoAction,
  isVideoMarker,
  isLinkAction,
  isSimpleContentAction,
  isReplaceTargetAction,
  isPopoverAction,
  isMailAction,
  isGoto360Action,
} from "./actions";
import {
  getMediaTargets,
  getVideoMarkerTarget,
  isMediaButton,
  isMediaExternalVideo,
  isMediaStandardVideo,
  isMediaTarget,
  isMediaVideo,
  isMediaSlideshow,
  isMediaHotspot,
  isMediaImage,
  isMediaFlipCard,
  isMediaHotspot360,
  isMediaHotspotPlain,
} from "./media";
import {
  getRepeaterComponents,
  isButtonComponent,
  isMediaComponent,
  isSoundComponent,
} from "./component";
import { findObject } from "../core";

export function validateContent(template: ContentTemplate) {
  const { medias, buttons, repeater } = template;
  const allMedias = [...medias, ...getRepeaterComponents(repeater.medias)];
  const allButtons = [...buttons, ...getRepeaterComponents(repeater.buttons)];

  for (let i = 0; i < allMedias.length; i++) {
    const media = allMedias[i];

    if (isMediaSlideshow(media)) {
      const {
        value: { items },
      } = media;

      items.forEach((item) => {
        const { clickAction } = item;

        validateAction(clickAction, template);
      });
    } else if (isMediaButton(media)) {
      const {
        value: { clickAction, overAction },
      } = media;

      validateAction(clickAction, template);
      validateAction(overAction, template);
    } else if (isMediaFlipCard(media)) {
      const {
        value: { clickAction, overAction },
      } = media;
      validateAction(clickAction, template);
      validateAction(overAction, template);
    } else if (isMediaTarget(media)) {
      const {
        value: { name, template },
      } = media;

      if (name.trim() === "") {
        throw new Error(i18next.t("utils:alert.enter_target"));
      } else if (!template || template.trim() === "") {
        // throw new Error(i18next.t("utils:alert.default_temp_target"));
      }
    } else if (isMediaVideo(media)) {
      throw new Error(i18next.t("utils:alert.video_type"));
    } else if (isMediaExternalVideo(media)) {
      const {
        value: { id },
      } = media;

      if (!id) {
        throw new Error(i18next.t("utils:alert.youtube_vimeo"));
      }
    } else if (isMediaStandardVideo(media)) {
      const {
        value: { main },
      } = media;

      if (!main) {
        throw new Error(i18next.t("utils:alert.mp4"));
      }
    } else if (isMediaHotspotPlain(media)) {
      throw new Error(i18next.t("utils:alert.hotspot_type"));
    } else if (isMediaHotspot(media)) {
      validateHotspot(media.value, template);
    } else if (isMediaHotspot360(media)) {
      validateHotspot360(media.value, template);
    }
  }

  for (let i = 0; i < allButtons.length; i++) {
    const button = allButtons[i];
    const {
      value: { clickAction, overAction },
    } = button;

    validateAction(clickAction, template);
    validateAction(overAction, template);
  }
}

export function validateHotspot(hotspot: MediaHotspot, template: ContentTemplate) {
  const { groups, items } = hotspot;

  validateHotspotGroups(groups);

  items.forEach((item) => validateHotspotItem(item, hotspot, template));
}

export function validateHotspot360(hotspot: MediaHotspot360, template: ContentTemplate) {
  hotspot.items.forEach((hotspot) => {
    validateHotspot(hotspot, template);
  });
}

export function validateHotspotGroups(groups: MediaHotspotGroups) {
  const { enabled, items } = groups;

  if (enabled) {
    items.forEach((item) => {
      const { name } = item;

      if (name.trim() === "") {
        throw new Error(i18next.t("utils:alert.hotspot_group_name"));
      }
    });
  }
}

export function validateHotspotItem(
  item: MediaHotspotItem,
  hotspot: MediaHotspot,
  template: ContentTemplate
) {
  const { groups } = hotspot;
  const { name, groupId, clickAction, overAction } = item;

  if (name.trim() === "") {
    throw new Error(i18next.t("utils:alert.hotspot_name"));
  } else if (groups.enabled && !groupId) {
    throw new Error(i18next.t("utils:alert.hotspot_group"));
  }

  validateAction(clickAction, template);
  validateAction(overAction, template);
}

export function validateAction(action: ComponentAction, template: ContentTemplate) {
  if (isSimpleContentAction(action)) {
    const { simpleContentId, option, display } = action.value || {};

    if (!simpleContentId) {
      throw new Error(i18next.t("utils:alert.simplecontent_element"));
    } else if (option === "popup" && !display) {
      throw new Error(i18next.t("utils:alert.simplecontent_display"));
    } else if (option === "flap" && !display) {
      throw new Error(i18next.t("utils:alert.simplecontent_display"));
    } else if (option === "target" && !display) {
      throw new Error(i18next.t("utils:alert.simplecontent_target"));
    }
  } else if (isLinkAction(action)) {
    const { url = "" } = action.value || {};

    if (!isURL(url)) {
      throw new Error(i18next.t("utils:alert.valid_url"));
    }
  } else if (isMailAction(action)) {
    const { email = "" } = action.value || {};

    if (!isEmail(email)) {
      throw new Error(i18next.t("utils:alert.valid_email"));
    }
  } else if (isReplaceTargetAction(action)) {
    const { replaceTargetId, replaceId } = action.value || {};
    const targets = getMediaTargets(template);

    if (!replaceTargetId && targets.length !== 1) {
      throw new Error(i18next.t("utils:alert.select_target"));
    } else if (!replaceId) {
      throw new Error(i18next.t("utils:alert.select_simplecontent"));
    }
  } else if (isGotoAction(action)) {
    const { action: gotoAction, gotoId } = action.value || {};

    if (!gotoAction) {
      throw new Error(i18next.t("utils:alert.select_action_goto"));
    } else if (gotoAction === GotoActionTypes.PageScreen && !gotoId) {
      throw new Error(i18next.t("utils:alert.select_element"));
    }
  } else if (isPopoverAction(action)) {
    validatePopoverAction(action.value, template);
  } else if (isGoto360Action(action)) {
    const { gotoId } = action.value || {};

    if (!gotoId) {
      throw new Error(i18next.t("utils:alert.select_360"));
    }
  } else if (isVideoMarker(action)) {
    const { marker } = action.value || {};
    const videoMArker = getVideoMarkerTarget(template, action.value);

    if (videoMArker && marker === "") {
      throw new Error(i18next.t("utils:alert.marker"));
    }
  }
}

export function validatePopoverAction(
  action: PopoverAction | undefined,
  template: ContentTemplate
) {
  if (!action) {
    throw new Error(i18next.t("utils:alert.detail_popover"));
  } else {
    const { button } = action;

    if (button) {
      const { checked, label, action } = button;

      if (checked) {
        if (!label) {
          throw new Error(i18next.t("utils:alert.label_popover"));
        } else if (!action || action.action === ComponentActionTypes.None) {
          throw new Error(i18next.t("utils:alert.action_popover"));
        } else {
          validateAction(action, template);
        }
      }
    }
  }
}

function isFormatEqual(format1: MediaFormat, format2: MediaFormat) {
  return (
    format1.value === format2.value &&
    format1.width === format2.width &&
    format1.height === format2.height
  );
}

function isTintEqual(tint1?: Tint, tint2?: Tint, defaultTint1?: Tint, defaultTint2?: Tint) {
  var color1 = tint1?.color ?? defaultTint1?.color;
  const color2 = tint2?.color ?? defaultTint2?.color;
  const alpha1 = tint1?.alpha ?? defaultTint1?.alpha ?? 50;
  const alpha2 = tint2?.alpha ?? defaultTint2?.alpha ?? 50;

  return color1 === color2 && alpha1 === alpha2;
}

function isStyleEqual(style1: ComponentStyle, style2: ComponentStyle) {
  const styleItem1 = style1.style ? GlTemplateBuilderStore.getStyleItem(style1.style) : undefined;
  const styleItem2 = style2.style ? GlTemplateBuilderStore.getStyleItem(style2.style) : undefined;

  return (
    style1.style === style2.style &&
    style1.hasLight === style2.hasLight &&
    !style1.hasDarkOut === !style2.hasDarkOut &&
    !style1.hasDarkOver === !style2.hasDarkOver &&
    !style1.isShadow === !style2.isShadow &&
    isTintEqual(style1.tint, style2.tint, styleItem1?.tint, styleItem2?.tint) &&
    isTintEqual(style1.bgTint, style2.bgTint, styleItem1?.bgTint, styleItem2?.bgTint) &&
    isTintEqual(style1.tintOut, style2.tintOut, styleItem1?.tintOut, styleItem2?.tintOut) &&
    isTintEqual(style1.tintOver, style2.tintOver, styleItem1?.tintOver, styleItem2?.tintOver)
  );
}

export function hasSameComponentStyles(
  template: ContentTemplate,
  component: MediaComponent | ButtonComponent | SoundComponent
) {
  const { repeaterId } = component;
  const { medias, buttons, sounds, repeater } = template;

  if (component.hasApplyStyle && isMediaComponent(component)) {
    const arr = repeaterId ? findObject(repeater.medias ?? [], repeaterId, "id")?.value : medias;

    if (arr) {
      return arr.every((media) => {
        if (media.hasApplyStyle) {
          if (isMediaImage(component) && isMediaImage(media)) {
            return (
              isFormatEqual(component.format, media.format) &&
              isStyleEqual(component.value.style, media.value.style) &&
              component.value.option === media.value.option &&
              component.value.isZoom === media.value.isZoom
            );
          } else if (isMediaButton(component) && isMediaButton(media)) {
            return (
              isFormatEqual(component.format, media.format) &&
              isStyleEqual(component.value.style, media.value.style) &&
              component.value.option === media.value.option
            );
          } else if (isMediaFlipCard(component) && isMediaFlipCard(media)) {
            return (
              isFormatEqual(component.format, media.format) &&
              isStyleEqual(component.value.recto.style, media.value.recto.style) &&
              isStyleEqual(component.value.verso.style, media.value.verso.style) &&
              component.value.recto.option === media.value.recto.option &&
              component.value.verso.option === media.value.verso.option
            );
          } else if (isMediaStandardVideo(component) && isMediaStandardVideo(media)) {
            return (
              isFormatEqual(component.format, media.format) &&
              isStyleEqual(component.value.style, media.value.style) &&
              component.value.option === media.value.option
            );
          }
        }

        return true;
      });
    }
  } else if (component.hasApplyStyle && isButtonComponent(component)) {
    const arr = repeaterId ? findObject(repeater.buttons ?? [], repeaterId, "id")?.value : buttons;

    if (arr) {
      return arr.every((button) => {
        return (
          button.hasApplyStyle &&
          isStyleEqual(component.value.style, button.value.style) &&
          isFormatEqual(button.buttonOptions.format, component.buttonOptions.format)
        );
      });
    }
  } else if (component.hasApplyStyle && isSoundComponent(component)) {
    const arr = repeaterId ? findObject(repeater.sounds ?? [], repeaterId, "id")?.value : sounds;

    if (arr) {
      return arr.every((sound) => {
        return sound.hasApplyStyle && isStyleEqual(component.value.style, sound.value.style);
      });
    }
  }

  return false;
}

export function hasSameActionStyles(
  actions: (ComponentAction & { value: { style?: string } })[],
  styleName: string
) {
  return actions.every((action) => {
    return action.value && action.value.style === styleName;
  });
}
