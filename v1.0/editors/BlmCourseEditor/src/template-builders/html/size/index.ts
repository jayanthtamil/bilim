import {
  BLMElement,
  ClassAttribute,
  StyleAttribute,
  CourseElementTemplate,
  TemplateSize,
} from "types";
import { TemplateWidthTypes } from "editor-constants";
import { createHTMLElement, valueToUnit } from "utils";
import { setBLMElement, getHTMLElement } from "../../core";

export const SIZE_STYLES = [
  "--partpage_width",
  "--partpage_top_margin",
  "--partpage_left_margin",
  "--partpage_bottom_margin",
  "--partpage_right_margin",
  "--partpage_top_padding",
  "--partpage_bottom_padding",
];

export function setTemplateSizeHTML(template: CourseElementTemplate, sizeModel: TemplateSize) {
  const htmlStr = typeof template === "string" ? template : template.html;
  const htmlElement = createHTMLElement(`<div>${htmlStr}</div>`);

  if (htmlElement) {
    setTemplateSize(htmlElement, sizeModel);

    return htmlElement.innerHTML;
  }

  return htmlStr;
}

function setTemplateSize(parent: HTMLElement, size: TemplateSize) {
  const outer = getHTMLElement(parent, ".outercontainer");
  const inner = getHTMLElement(parent, ".innercontainer");
  const outerModel = new BLMElement();
  const innerModel = new BLMElement();

  if (outer) {
    outerModel.classAttr = new ClassAttribute();

    if (size.isFullscreen) {
      outerModel.classAttr.items = ["fullscreen"];
    } else {
      outerModel.classAttr.removables = ["fullscreen"];
    }

    if (inner) {
      const classAttr = new ClassAttribute();
      const styleAttr = new StyleAttribute();

      classAttr.removables = ["templateleft", "templatecenter", "templateright"];
      styleAttr.removables = SIZE_STYLES;

      if (!size.isFullscreen) {
        const {
          width: { type, width },
          margin: { left, top, right },
          padding: { top: pTop, bottom: pBottom },
        } = size;
        const widhtValue = valueToUnit(width.value, width.isSelected);

        if (type === TemplateWidthTypes.Left) {
          classAttr.items = ["templateleft"];
          styleAttr["--partpage_width"] = widhtValue;
          styleAttr["--partpage_left_margin"] = valueToUnit(left.value, left.isSelected);
        } else if (type === TemplateWidthTypes.Center) {
          classAttr.items = ["templatecenter"];
          styleAttr["--partpage_width"] = widhtValue;
        } else if (type === TemplateWidthTypes.Right) {
          classAttr.items = ["templateright"];
          styleAttr["--partpage_width"] = widhtValue;
          styleAttr["--partpage_right_margin"] = valueToUnit(right.value, right.isSelected);
        }

        if (top) {
          styleAttr["--partpage_top_margin"] = valueToUnit(top.value, true);
        }

        if (pTop) {
          styleAttr["--partpage_top_padding"] = valueToUnit(pTop.value, true);
        }

        if (pBottom) {
          styleAttr["--partpage_bottom_padding"] = valueToUnit(pBottom.value, true);
        }
      }

      innerModel.classAttr = classAttr;
      innerModel.styleAttr = styleAttr;

      setBLMElement(inner, innerModel);
    }

    setBLMElement(outer, outerModel);
  }
}
