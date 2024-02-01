import { ComponentAction, ComponentStyle, MediaFile, SimpleObject } from "types";
import { ComponentActionTypes, GotoActionTypes, Positions, StyleListTypes } from "editor-constants";
import { toBoolean, toJSONObject } from "utils";
import { createTint, getBLMElement, getHTMLElement } from "../../core";
import { GlTemplateBuilderStore } from "../../store";

export function createComponentStyle(
  element: HTMLElement,
  type: StyleListTypes,
  hasTint = false,
  tintSelector?: string
) {
  const style = new ComponentStyle();

  style.style = getComponentStyle(element, type);

  if (hasTint) {
    const tint = tintSelector ? getHTMLElement(element, tintSelector) : element;

    if (tint) {
      style.tint = createTint(tint.style, "--blm_tint_color", "--blm_tint_opacity");
      style.bgTint = createTint(tint.style, "--blm_undertext_color", "--blm_undertext_opacity");
      style.tintOut = createTint(tint.style, "--tintout", "--opacityout");
      style.tintOver = createTint(tint.style, "--tintover", "--opacityover");
    }
  }

  style.hasDarkOut = element.classList.contains("darkout");
  style.hasDarkOver = element.classList.contains("darkover");
  style.isShadow = element.classList.contains("shadow") || element.classList.contains("blmshadow");

  if (type === "media-button" || type === "media-button-summary") {
    style.hasDarkOut = element.classList.contains("light");
    style.hasDarkOver = element.classList.contains("lightover");
  }
  if (type !== "media-button" && type !== "media-button-summary") {
    style.hasLight = element.classList.contains("light");
  }

  return style;
}

export function getComponentStyle(element: HTMLElement, type: StyleListTypes) {
  const classList = element.classList;
  const styles = GlTemplateBuilderStore.getStyles();
  const classNames = styles && styles[type]?.classNames;

  return Array.from(classList).find((cls) => classNames?.includes(cls));
}

export function createAction(type: "click" | "over", attr?: SimpleObject, wrapper?: HTMLElement) {
  const result = new ComponentAction();

  if (attr) {
    const { action } = attr;

    result.action = action;

    if (action === ComponentActionTypes.OpenSimpleConent) {
      const { uid, target } = attr;
      let { display } = attr;
      let option = target;

      if (target && target.startsWith("target")) {
        const arr = /(\d+)/.exec(target);

        option = "target";
        display = arr ? arr[0] : undefined;
      }

      result.value = { simpleContentId: uid, option, display };
    } else if (action === ComponentActionTypes.OpenDocument) {
      const { document } = attr;

      result.value = { document };
    } else if (action === ComponentActionTypes.OpenLink) {
      const { url } = attr;

      result.value = { url };
    } else if (action === ComponentActionTypes.MailTo) {
      const { email } = attr;

      result.value = { email };
    } else if (action === ComponentActionTypes.ReplaceBackground) {
      const { background, restore } = attr;
      result.value = { background, restore: restore };
    } else if (action === ComponentActionTypes.ReplaceTarget) {
      const { target, uid, restore } = attr;
      result.value = { replaceTargetId: target, replaceId: uid, restore: restore };
    } else if (action === ComponentActionTypes.Navigation) {
      let { option } = attr;
      let gotoId;

      if (option && option.startsWith(GotoActionTypes.PageScreen)) {
        const arr = /(\d+)/.exec(option);

        option = GotoActionTypes.PageScreen;
        gotoId = arr ? arr[0] : undefined;
      }

      result.value = { action: option, gotoId };
    } else if (action === ComponentActionTypes.Goto) {
      let { option } = attr;
      let gotoId;
      if (option && option.startsWith(GotoActionTypes.PageScreen)) {
        const arr = /(\d+)/.exec(option);

        option = GotoActionTypes.PageScreen;
        gotoId = arr ? arr[0] : undefined;
      }

      result.value = { action: option, gotoId };
    } else if (action === ComponentActionTypes.Tooltip) {
      const { style } = attr;

      result.value = {
        style,
        label:
          (wrapper &&
            getHTMLElement(wrapper, type === "click" ? ".tooltipclick span" : ".tooltipover span")
              ?.innerHTML) ??
          "",
      };
    } else if (action === ComponentActionTypes.Popover && wrapper) {
      const { "blm-popover-id": popoverId } = attr;

      if (popoverId) {
        const element = getHTMLElement(wrapper, `[blm-popover-id='${popoverId}']`);

        if (element) {
          const model = getBLMElement<object, { media?: MediaFile }>(element);
          const media = model.editorOptions?.media || undefined;
          const title = getHTMLElement(element, ".hotspot_title")?.innerHTML || "";
          const description = getHTMLElement(element, ".hotspot_description")?.innerHTML || "";
          const style = getComponentStyle(element, StyleListTypes.MediaHotspotPopover);
          const position = (element.getAttribute("blm-position") as Positions) || undefined;
          const button = getHTMLElement(element, ".hotspot_action");
          const checked = toBoolean(button?.getAttribute("blm-checked"));
          const label = (button && getHTMLElement(button, ".hotspot_label")?.innerHTML) || "";
          const btnAction =
            button &&
            toJSONObject<{
              onClick?: SimpleObject;
            }>(button.getAttribute("blm-action"));

          result.value = {
            media,
            title,
            description,
            style,
            position,
            button: { checked, label, action: createAction("click", btnAction?.onClick) },
          };
        }
      }
    } else if (action === ComponentActionTypes.MediaLayer) {
      const { layer } = attr;

      result.value = { layer };
    } else if (action === ComponentActionTypes.Goto360) {
      const { gotoId } = attr;

      result.value = { gotoId };
    } else if (action === ComponentActionTypes.CloseOrExit) {
      const { option } = attr;
      result.value = { action: option };
    } else if (action === ComponentActionTypes.VideoMarker) {
      const { option } = attr;
      const options = option.split("-");
      result.value = { video: options[0], marker: options[1] };
    } else if (action === ComponentActionTypes.AudioMarker) {
      const { option } = attr;
      const options = option.split("-");
      result.value = { sound: options[0], marker: options[1] };
    }
  }

  return result;
}
