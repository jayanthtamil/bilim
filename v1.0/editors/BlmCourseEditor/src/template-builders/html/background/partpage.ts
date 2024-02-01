import {
  BLMElement,
  ClassAttribute,
  StyleAttribute,
  CourseElementTemplate,
  PartPageBackground,
  TemplateEditorOptionsJSON,
  TemplateOptionsJSON,
} from "types";
import {
  BackgroundSizeTypes,
  BackgroundOptionTypes,
  MediaBackgroundPosition,
} from "editor-constants";
import { createHTMLElement, isImage, createRGBA } from "utils";
import { setBLMElement, getHTMLElement } from "../../core";
import {
  BG_STYLES,
  createVideoElement,
  getMediaClass,
  clearOptions,
  clearEditorOptions,
} from "./common";

export function setPartPageBackgroundHTML(
  template: CourseElementTemplate,
  background: PartPageBackground
) {
  const htmlStr = template.html;
  const htmlElement = createHTMLElement(`<div>${htmlStr}</div>`);

  if (htmlElement) {
    clearPartPageBackground(htmlElement);
    setPartPageBackground(htmlElement, background);

    return htmlElement.innerHTML;
  }

  return htmlStr;
}

function setPartPageBackground(parent: HTMLElement, background: PartPageBackground) {
  const outer = getHTMLElement(parent, ".outercontainer");
  const inner = getHTMLElement(parent, ".innercontainer");
  const { media, mediaSize, tint: bgTint, colorSize } = background;
  const { main, tint, option, optionValue, option3, position } = media;

  if (outer) {
    const hasImage = main && isImage(main.type);
    const bgColor = createRGBA(bgTint.color, bgTint.alpha);
    const isSame = hasImage && bgColor && mediaSize === colorSize;

    if (main) {
      if (hasImage) {
        const imageModel = new BLMElement<TemplateOptionsJSON, TemplateEditorOptionsJSON>();
        const tintRgb = createRGBA(tint.color, tint.alpha);
        const classAttr = new ClassAttribute();
        const styleAttr = new StyleAttribute();

        styleAttr.removables = BG_STYLES;
        styleAttr.backgroundImage = `${
          tintRgb ? `linear-gradient(0deg, ${tintRgb}, ${tintRgb}), ` : ""
        }url(${main.url})`;

        if (isSame) {
          styleAttr.backgroundColor = bgColor;
        }

        classAttr.items.push(getMediaClass(option));
        classAttr.items.push(getMediaClass(option3));

        if (position) {
          classAttr.items.push(position);
        }

        imageModel.classAttr = classAttr;
        imageModel.styleAttr = styleAttr;

        if (option === BackgroundOptionTypes.Parallax) {
          imageModel.options = { parallax: optionValue as number };
        }

        imageModel.editorOptions = {
          media: { main, tint: tint.color ? tint : undefined },
        };

        setPartPageBackgrondModel(outer, inner, mediaSize, imageModel);
      } else {
        const videoElement = createVideoElement(media);

        if (videoElement) {
          if (mediaSize === BackgroundSizeTypes.Content) {
            if (inner && inner.parentElement) {
              inner.parentElement.insertBefore(videoElement, inner);
            }
          } else {
            outer.insertBefore(videoElement, outer.firstChild);
          }
        }
      }
    }

    if (!isSame && bgColor) {
      const colorModel = new BLMElement();
      const styleAttr = new StyleAttribute();

      styleAttr.removables = BG_STYLES;
      styleAttr.backgroundColor = bgColor;

      colorModel.styleAttr = styleAttr;

      setPartPageBackgrondModel(outer, inner, colorSize, colorModel);
    }
  }
}

function setPartPageBackgrondModel(
  outer: HTMLElement,
  inner: HTMLElement | null,
  size: BackgroundSizeTypes,
  model: BLMElement
) {
  const target = size === BackgroundSizeTypes.Content ? inner : outer;

  if (target) {
    if (model.options) {
      const options = clearOptions(target);

      model.options = { ...options, ...model.options };
    }

    if (model.editorOptions) {
      const editorOptions = clearEditorOptions(target);

      model.editorOptions = { ...editorOptions, ...model.editorOptions };
    }

    setBLMElement(target, model);
  }
}

function clearPartPageBackground(parent: HTMLElement) {
  const outer = getHTMLElement(parent, ".outercontainer");
  const inner = getHTMLElement(parent, ".innercontainer");
  const video = getHTMLElement(parent, ".videoouter");

  if (video && video.parentElement) {
    video.parentElement.removeChild(video);
  }

  if (outer) {
    clearPartPageBackgroundHTML(outer);
  }

  if (inner) {
    clearPartPageBackgroundHTML(inner);
  }
}

function clearPartPageBackgroundHTML(element: HTMLElement) {
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
