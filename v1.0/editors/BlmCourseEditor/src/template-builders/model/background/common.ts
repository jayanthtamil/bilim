import { BackgroundMedia, TemplateEditorOptionsJSON, TemplateOptionsJSON } from "types";
import {
  BackgroundOptionTypes,
  ImageDisplayTypes,
  MediaBackgroundPosition,
} from "editor-constants";
import { getBLMElement } from "../../core";
import { getObjectKey } from "utils";

export function getBackgroundImage(element: HTMLElement) {
  const background = new BackgroundMedia();
  const { classList } = element;
  const model = getBLMElement<TemplateOptionsJSON, TemplateEditorOptionsJSON>(element);

  if (model.editorOptions && model.editorOptions.media) {
    const { main, tint } = model.editorOptions.media;

    background.main = main;

    if (tint) {
      background.tint = tint;
    }

    background.position = getObjectKey(
      MediaBackgroundPosition,
      element.classList,
      background.position
    );

    if (classList.contains("backgroundstandard")) {
      background.option = BackgroundOptionTypes.Standard;
    } else if (classList.contains("backgroundparallaxe")) {
      background.option = BackgroundOptionTypes.Parallax;
      if (model.options) {
        background.optionValue = model.options.parallax as number;
      }
    } else if (classList.contains("backgroundmask")) {
      background.option = BackgroundOptionTypes.Mask;
    } else if (classList.contains("backgroundfullscreen")) {
      background.option = BackgroundOptionTypes.FullScreen;
    }

    if (classList.contains("backgroundcover")) {
      background.option3 = ImageDisplayTypes.Cover;
    } else if (classList.contains("backgroundcontain")) {
      background.option3 = ImageDisplayTypes.Contain;
    } else if (classList.contains("backgroundnoresize")) {
      background.option3 = ImageDisplayTypes.NoResize;
    }
  }

  return background;
}

export function getBackgroundVideo(element: HTMLElement) {
  const background = new BackgroundMedia();
  const { classList } = element;
  const model = getBLMElement<object, { media: Omit<BackgroundMedia, "option" | "optionValue"> }>(
    element
  );

  if (model.editorOptions && model.editorOptions.media) {
    const { main, webm, image, tint } = model.editorOptions.media;

    background.main = main;
    background.webm = webm;
    background.image = image;

    if (tint) {
      background.tint = tint;
    }

    if (classList.contains("autoplay") || classList.contains("loop")) {
      background.option = BackgroundOptionTypes.Autoplay;
      if (classList.contains("loop")) {
        background.optionValue = true;
      }
    } else if (classList.contains("scroll")) {
      background.option = BackgroundOptionTypes.Scroll;
    }
  }

  return background;
}
