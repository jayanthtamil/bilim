import { BackgroundMedia, TemplateEditorOptionsJSON, TemplateOptionsJSON } from "types";
import { BackgroundOptionTypes, ImageDisplayTypes } from "editor-constants";
import { createHTMLElement, createRGBA } from "utils";
import { getBLMElement } from "../../core";

export const BG_STYLES = ["backgroundImage", "backgroundColor"];

export const createVideoElement = (media: BackgroundMedia) => {
  const { main, webm, image, tint, option, optionValue } = media;
  const rgba = createRGBA(tint.color, tint.alpha);
  const clsName = getMediaClass(option, optionValue);
  const attrs = getVideoAttributes(clsName);
  const imgAttr = image ? `poster="${image.url}" ` : "";
  const webmSrc = webm ? `\n    <source src="${webm.url}" type="video/webm"/>` : "";
  const overlay = rgba ? `\n  <div class="videooverlay" style="background: ${rgba}"></div>` : "";
  const editOption = JSON.stringify({ media: { main, webm, image, tint } });

  if (main) {
    const html = `<div class="videoouter ${clsName}" blm-editor-options='${editOption}'>
        <video muted ${attrs} class="backgroundvideo" ${imgAttr}>
          <source src="${main.url}" type="video/mp4"/>${webmSrc}
        </video>
        ${overlay}
        </div>`;

    return createHTMLElement(html);
  }
};

export function getMediaClass(
  option: BackgroundOptionTypes | ImageDisplayTypes,
  value?: number | boolean
) {
  switch (option) {
    case BackgroundOptionTypes.Standard:
      return "backgroundstandard";
    case BackgroundOptionTypes.Parallax:
      return "backgroundparallaxe";
    case BackgroundOptionTypes.Mask:
      return "backgroundmask";
    case BackgroundOptionTypes.FullScreen:
      return "backgroundfullscreen";
    case BackgroundOptionTypes.Autoplay:
      if (!value) {
        return "autoplay";
      } else {
        return "loop";
      }
    case BackgroundOptionTypes.Scroll:
      return "scroll";
    case ImageDisplayTypes.Cover:
      return "backgroundcover";
    case ImageDisplayTypes.Contain:
      return "backgroundcontain";
    case ImageDisplayTypes.NoResize:
      return "backgroundnoresize";
    default:
      return "";
  }
}

export function clearOptions(element: HTMLElement) {
  const model = getBLMElement<TemplateOptionsJSON, TemplateEditorOptionsJSON>(element);

  if (model.options) {
    const { parallax, sound, ...others } = model.options;

    return Object.keys(others).length ? { ...others } : null;
  }

  return null;
}

export function clearEditorOptions(element: HTMLElement) {
  const model = getBLMElement<TemplateOptionsJSON, TemplateEditorOptionsJSON>(element);

  if (model.editorOptions) {
    const { media, ...others } = model.editorOptions;

    return Object.keys(others).length ? { ...others } : null;
  }

  return null;
}

function getVideoAttributes(className: string) {
  if (className === "autoplay") {
    return "autoplay";
  } else if (className === "loop") {
    return "autoplay loop";
  } else {
    return "";
  }
}
