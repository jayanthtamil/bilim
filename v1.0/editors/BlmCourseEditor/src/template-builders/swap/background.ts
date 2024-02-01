import { CourseElementTemplate } from "types";
import { setPartPageBackgroundHTML, setScreenBackgroundHTML } from "../html";
import {
  getPartPageBackgroundModel,
  getScreenBackgroundModel,
  getTemplateSizeModel,
} from "../model";
import { createHTMLElement } from "utils";
import { getHTMLElement, setTemplateSizeHTML } from "template-builders";

export function copyScreenBackground(
  source: CourseElementTemplate,
  destination: CourseElementTemplate
) {
  const background = getScreenBackgroundModel(source);

  if (background) {
    return setScreenBackgroundHTML(destination, background);
  }

  return source.html;
}

export function copyPartPageBackground(
  source: CourseElementTemplate,
  destination: CourseElementTemplate
) {
  const background = getPartPageBackgroundModel(source);

  if (background) {
    return setPartPageBackgroundHTML(destination, background);
  }

  return source.html;
}

export function copyMarginReplaceTemplate(
  template: CourseElementTemplate,
  newTemplate: CourseElementTemplate
) {
  const htmlElement = createHTMLElement(`<div>${template.html}</div>`);
  if (htmlElement) {
    const inner = getHTMLElement(htmlElement, ".innercontainer");

    if (inner) {
      const { style } = inner;
      const globalStyle = getComputedStyle(htmlElement, ".innercontainer");

      const marginTop = style.getPropertyValue("--partpage_top_margin");
      const marginLeft = style.getPropertyValue("--partpage_left_margin");
      const marginBottom = style.getPropertyValue("--partpage_bottom_margin");
      const marginRight = style.getPropertyValue("--partpage_right_margin");
      const paddingTop = style.getPropertyValue("--partpage_top_padding");
      const paddingBottom = style.getPropertyValue("--partpage_bottom_padding");
      const globalMarginTop = globalStyle?.getPropertyValue("--partpage_top_margin") ?? "";
      const globalMarginBottom = globalStyle?.getPropertyValue("--partpage_bottom_margin") ?? "";
      const globalPaddingTop = globalStyle?.getPropertyValue("--partpage_top_padding") ?? "";
      const globalPaddingBottom = globalStyle?.getPropertyValue("--partpage_bottom_padding") ?? "";

      if (
        !marginTop &&
        !marginLeft &&
        !marginBottom &&
        !marginRight &&
        !globalMarginTop &&
        !globalMarginBottom &&
        !paddingTop &&
        !paddingBottom &&
        !globalPaddingTop &&
        !globalPaddingBottom
      ) {
        return newTemplate.html;
      } else {
        let newSize = getTemplateSizeModel(template, htmlElement);
        if (typeof newSize !== "boolean" && newSize) {
          return setTemplateSizeHTML(newTemplate, newSize);
        }
      }
    }
  }
  return newTemplate.html;
}
