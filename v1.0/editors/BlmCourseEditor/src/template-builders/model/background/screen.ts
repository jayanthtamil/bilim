import { CourseElementTemplate, ScreenBackground } from "types";
import { fromRgbaStr, createHTMLElement } from "utils";
import { getHTMLElement } from "../../core";
import { getBackgroundImage, getBackgroundVideo } from "./common";

export function getScreenBackgroundModel(template: CourseElementTemplate) {
  const htmlElement = createHTMLElement(`<div>${template.html}</div>`);

  if (htmlElement) {
    return getScreenBackground(htmlElement);
  }
}

function getScreenBackground(parent: HTMLElement) {
  const outer = getHTMLElement(parent, ".outercontainer");
  const video = getHTMLElement(parent, ".videoouter");
  const background = new ScreenBackground();

  if (outer) {
    if (video) {
      background.media = getBackgroundVideo(video);
    } else if (outer.style.backgroundImage !== "") {
      background.media = getBackgroundImage(outer);
    }

    if (outer.style.backgroundColor !== "") {
      background.tint = fromRgbaStr(outer.style.backgroundColor);
    }
  }

  return background;
}
