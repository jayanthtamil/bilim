import { ComponentAction, ComponentStyle, SimpleObject } from "types";
import { GotoActionTypes, Positions, StyleListTypes } from "editor-constants";
import {
  isDocumentAction,
  isLinkAction,
  isSimpleContentAction,
  isNavigationAction,
  isReplaceBackgroundAction,
  isReplaceTargetAction,
  isPopoverAction,
  createShortUUID,
  isTooltipAction,
  isMediaLayerAction,
  isMailAction,
  isGoto360Action,
  isGotoAction,
  isCloseOrExit,
  isVideoMarker,
  isAudioMaker,
} from "utils";
import { GlTemplateBuilderStore } from "../../store";

export function getComponentClassNames(types: StyleListTypes[]) {
  const styles = GlTemplateBuilderStore.getStyles();
  const result: string[] = [];

  if (styles) {
    types.forEach((type) => {
      if (styles[type]) {
        result.push(...styles[type]!.classNames);
      }
    });
  }

  return result;
}

export function getStyleClassNames(compStyle: ComponentStyle, type?: string) {
  const { style, hasLight, hasDarkOut, hasDarkOver, isShadow } = compStyle;
  const result = [];

  if (style) {
    result.push(style);
  }

  if (hasLight) {
    result.push("light");
  }

  if (type === "button") {
    if (hasDarkOut) {
      result.push("darkout");
    }
    if (hasDarkOver) {
      result.push("darkover");
    }
  }

  if (type === "media-button" || type === "media-button-summary") {
    if (hasDarkOut) {
      result.push("light");
    }

    if (hasDarkOver) {
      result.push("lightover");
    }
  }

  if ((type === "button" || type === "sound") && isShadow) {
    result.push("shadow");
  }
  if ((type === "media-image" || type === "media-button" || type === "media-video") && isShadow) {
        result.push("blmshadow");
  }
  return result;
}

export function getTintStyles(compStyle: ComponentStyle) {
  const { tint, bgTint, tintOut, tintOver } = compStyle;
  const result: SimpleObject = {};

  if (tint) {
    if (tint.color) {
      result["--blm_tint_color"] = tint.color;
    }
    result["--blm_tint_opacity"] = (tint.alpha ?? 50) / 100;
  }

  if (bgTint) {
    result["--blm_undertext_color"] = bgTint.color || "unset";
    result["--blm_undertext_opacity"] = (bgTint.alpha ?? 0) / 100;
  }

  if (tintOut) {
    if (tintOut.color) {
      result["--tintout"] = tintOut.color;
    }
    result["--opacityout"] = (tintOut.alpha ?? 50) / 100;
  }

  if (tintOver) {
    if (tintOver.color) {
      result["--tintover"] = tintOver.color;
    }
    result["--opacityover"] = (tintOver.alpha ?? 50) / 100;
  }

  return result;
}

export function createAction(
  compAction: ComponentAction,
  type: "click" | "over"
): SimpleObject | undefined {
  const { action } = compAction;

  if (isSimpleContentAction(compAction) && compAction.value) {
    const { simpleContentId, option, display } = compAction.value;

    return {
      action,
      uid: simpleContentId,
      target: option === "target" ? `${option}-${display}` : option,
      display: option === "popup" || option === "flap" ? display : undefined,
    };
  } else if (isDocumentAction(compAction) && compAction.value) {
    const { document } = compAction.value;

    return {
      action,
      originalname: document?.name,
      src: document?.url,
      document,
    };
  } else if (isLinkAction(compAction) && compAction.value) {
    const { url } = compAction.value;

    return {
      action,
      url,
    };
  } else if (isMailAction(compAction) && compAction.value) {
    const { email } = compAction.value;

    return {
      action,
      email,
    };
  } else if (isReplaceBackgroundAction(compAction) && compAction.value) {
    const { background, restore } = compAction.value;
    let value = {
      action,
      originalname: background?.name,
      src: background?.url,
      background,
      restore: restore,
    };
    if (restore === undefined) {
      delete value.restore;
    }

    return value;
  } else if (isReplaceTargetAction(compAction) && compAction.value) {
    const { replaceTargetId, replaceId, restore } = compAction.value;
    let value = {
      action,
      target: replaceTargetId,
      uid: replaceId,
      restore: restore,
    };
    if (restore === undefined) {
      delete value.restore;
    }

    return value;
  } else if (isNavigationAction(compAction) && compAction.value) {
    const { action: gotoAction, gotoId } = compAction.value;
    const navigationAction = "goto";
    return {
      action: navigationAction,
      option: gotoAction === GotoActionTypes.PageScreen ? `${gotoAction}-${gotoId}` : gotoAction,
    };
  } else if (isGotoAction(compAction) && compAction.value) {
    const { gotoId } = compAction.value;
    const gotoAction = GotoActionTypes.PageScreen;
    return {
      action: "goto",
      option: `${gotoAction}-${gotoId}`,
    };
  } else if (isTooltipAction(compAction) && compAction.value) {
    const { style, label } = compAction.value;

    return {
      action,
      style,
      html: `
              <div class="${type === "click" ? "tooltipclick" : "tooltipover"}">
                <span>${label ?? ""}</span>
              </div>`,
    };
  } else if (isPopoverAction(compAction) && compAction.value) {
    const { media, title, description, position = Positions.Top, style, button } = compAction.value;
    const { checked, label, action: btnAction } = button || {};
    const id = createShortUUID();
    const options = { media };
    const onClick = btnAction && createAction(btnAction, "click");

    return {
      action,
      "blm-popover-id": id,
      html: `
              <div class="popoverwrapper ${
                style || ""
              }" blm-position="${position}" blm-popover-id="${id}" ${
        options ? `blm-editor-options='${JSON.stringify(options)}'` : ""
      }>  
                <div class="popovermediawrapper">
                  <img src="${media?.url || ""}"/>
                </div>
                <div class="popovertextwrapper">
                  <div class="hotspot_title">${title || ""}</div>
                  <div class="hotspot_description">${description || ""}</div>
                  <div class="hotspot_action" blm-checked="${checked}" ${
        onClick
          ? `blm-action='${JSON.stringify({
              onClick,
            })}'`
          : ""
      } >
                    <span class="hotspot_label">${label || ""}</span>
                  </div>
                </div>
              </div>`,
    };
  } else if (isMediaLayerAction(compAction) && compAction.value) {
    const { layer } = compAction.value;

    return {
      action,
      path: layer?.url,
      layer,
    };
  } else if (isGoto360Action(compAction) && compAction.value) {
    const { gotoId } = compAction.value;

    return {
      action,
      gotoId,
    };
  } else if (isCloseOrExit(compAction) && compAction.value) {
    const { action: closeAction } = compAction.value;
    return {
      action,
      option: closeAction,
    };
  } else if (isVideoMarker(compAction) && compAction.value) {
    const { video, marker } = compAction.value;
    return {
      action: "videomarker",
      option: `${video}-${marker}`,
    };
  } else if (isAudioMaker(compAction) && compAction.value) {
    const { sound, marker } = compAction.value;
    return {
      action: "audiomarker",
      option: `${sound}-${marker}`,
    };
  }
}
