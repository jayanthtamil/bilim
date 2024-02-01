import { CourseElementTemplate, PartPageBackground } from "types";
import { BackgroundSizeTypes } from "editor-constants";
import { fromRgbaStr, createHTMLElement } from "utils";
import { getHTMLElement } from "../../core";
import { getBackgroundImage, getBackgroundVideo } from "./common";

export function getPartPageBackgroundModel(template: CourseElementTemplate) {
  const htmlElement = createHTMLElement(`<div>${template.html}</div>`);

  if (htmlElement) {
    return getPartPageBackground(htmlElement);
  }
}

function getPartPageBackground(parent: HTMLElement) {
  const outer = getHTMLElement(parent, ".outercontainer");
  const inner = getHTMLElement(parent, ".innercontainer");
  const video = getHTMLElement(parent, ".videoouter");
  const background = new PartPageBackground();

  if (outer) {
    if (video) {
      background.media = getBackgroundVideo(video);

      if (inner && video.parentElement === inner.parentElement) {
        background.mediaSize = BackgroundSizeTypes.Content;
      } else if (video.parentElement === outer) {
        background.mediaSize = BackgroundSizeTypes.Large;
      }
    } else {
      if (inner && inner.style.backgroundImage !== "") {
        background.media = getBackgroundImage(inner);
        background.mediaSize = BackgroundSizeTypes.Content;
      } else if (outer.style.backgroundImage !== "") {
        background.media = getBackgroundImage(outer);
        background.mediaSize = BackgroundSizeTypes.Large;
      }
    }

    if (inner && inner.style.backgroundColor !== "") {
      background.tint = fromRgbaStr(inner.style.backgroundColor);
      background.colorSize = BackgroundSizeTypes.Content;
    } else if (outer.style.backgroundColor !== "") {
      background.tint = fromRgbaStr(outer.style.backgroundColor);
      background.colorSize = BackgroundSizeTypes.Large;
    }
  }

  return background;
}
