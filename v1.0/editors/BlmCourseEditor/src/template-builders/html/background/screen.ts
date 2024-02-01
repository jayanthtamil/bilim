import {
  BLMElement,
  StyleAttribute,
  CourseElementTemplate,
  ScreenBackground,
  TemplateOptionsJSON,
  TemplateEditorOptionsJSON,
  ClassAttribute,
} from "types";
import { createHTMLElement, isImage, createRGBA } from "utils";
import { setBLMElement, getHTMLElement } from "../../core";
import {
  BG_STYLES,
  createVideoElement,
  clearOptions,
  clearEditorOptions,
  getMediaClass,
} from "./common";
import { BackgroundOptionTypes, MediaBackgroundPosition } from "editor-constants";

export function setScreenBackgroundHTML(
  template: CourseElementTemplate,
  background: ScreenBackground
) {
  const htmlStr = template.html;
  const htmlElement = createHTMLElement(`<div>${template.html}</div>`);

  if (htmlElement) {
    clearScreenBackground(htmlElement);
    setScreenBackground(htmlElement, background);

    return htmlElement.innerHTML;
  }

  return htmlStr;
}

function setScreenBackground(parent: HTMLElement, background: ScreenBackground) {
  const outer = getHTMLElement(parent, ".outercontainer");
  const { media, tint: bgTint } = background;
  const { main, tint, option, optionValue, option3, position } = media;

  if (outer) {
    const options = clearOptions(outer);
    const editorOptions = clearEditorOptions(outer);
    const hasImage = main && isImage(main.type);
    const bgColor = createRGBA(bgTint.color, bgTint.alpha);

    if (main) {
      if (hasImage) {
        const imageModel = new BLMElement<TemplateOptionsJSON, TemplateEditorOptionsJSON>();
        const styleAttr = new StyleAttribute();
        const classAttr = new ClassAttribute();
        const tintRgb = createRGBA(tint.color, tint.alpha);

        styleAttr.removables = BG_STYLES;
        styleAttr.backgroundImage = `${
          tintRgb ? `linear-gradient(0deg, ${tintRgb}, ${tintRgb}), ` : ""
        }url(${main.url})`;
        styleAttr.backgroundColor = bgColor;

        imageModel.styleAttr = styleAttr;
        imageModel.options = options;
        imageModel.editorOptions = {
          ...editorOptions,
          media: { main, tint: tint.color ? tint : undefined },
        };

        classAttr.items.push(getMediaClass(option));
        classAttr.items.push(getMediaClass(option3));

        if (position) {
          classAttr.items.push(position);
        }
        imageModel.classAttr = classAttr;

        if (option === BackgroundOptionTypes.Parallax) {
          imageModel.options = { parallax: optionValue as number };
        }

        imageModel.editorOptions = {
          media: { main, tint: tint.color ? tint : undefined },
        };
  
        setBLMElement(outer, imageModel);
      } else {
        const videoElement = createVideoElement(media);

        if (videoElement) {
          outer.insertBefore(videoElement, outer.firstChild);
        }
      }
    }

    if (!hasImage && bgColor) {
      const colorModel = new BLMElement<TemplateOptionsJSON, TemplateEditorOptionsJSON>();
      colorModel.options = options;

      if (bgColor) {
        const styleAttr = new StyleAttribute();

        styleAttr.removables = BG_STYLES;
        styleAttr.backgroundColor = bgColor;

        colorModel.styleAttr = styleAttr;
      }

      setBLMElement(outer, colorModel);
    }
  }
}

function clearScreenBackground(parent: HTMLElement) {
  const outer = getHTMLElement(parent, ".outercontainer");
  const video = getHTMLElement(parent, ".videoouter");

  if (video && video.parentElement) {
    video.parentElement.removeChild(video);
  }

  if (outer) {
    clearScreenBackgroundHTML(outer);
  }
}

function clearScreenBackgroundHTML(element: HTMLElement) {
  const model = new BLMElement<TemplateOptionsJSON, TemplateEditorOptionsJSON>();

  model.classAttr = new ClassAttribute();
  model.classAttr.removables = [
    ...Object.values(MediaBackgroundPosition),
    "backgroundstandard",
    "backgroundparallaxe",
    "backgroundmask",
    "backgroundfullscreen",
    "backgroundcover",
    "backgroundcontain",
    "backgroundnoresize",
  ];

  model.styleAttr = new StyleAttribute();
  model.styleAttr.removables = BG_STYLES;
  model.options = clearOptions(element);
  model.editorOptions = clearEditorOptions(element);

  setBLMElement(element, model);
}
