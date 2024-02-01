import { CourseElementTemplate, TemplateSize } from "types";
import { TemplateWidthTypes } from "editor-constants";
import { hasPixel, createHTMLElement, unitToValue, toNumber } from "utils";
import { getComputedStyle, getHTMLElement } from "../../core";

export function getTemplateSizeModel(template: CourseElementTemplate, templateEle: HTMLElement) {
  const htmlElement = createHTMLElement(`<div>${template.html}</div>`);

  if (htmlElement) {
    return getTemplateSize(htmlElement, templateEle);
  }
}

function getTemplateSize(parent: HTMLElement, templateEle: HTMLElement) {
  const outer = getHTMLElement(parent, ".outercontainer");
  const inner = getHTMLElement(parent, ".innercontainer");
  const size = new TemplateSize();

  if (outer) {
    size.isFullscreen = outer.classList.contains("fullscreen");

    if (inner) {
      const globalStyle = getComputedStyle(templateEle, ".innercontainer");
      const { classList, style } = inner;
      var {
        width,
        margin: { left, top, right, bottom, globalTop },
        padding: { top: pTop, bottom: pBottom },
      } = size;
      const { width: newWidth } = width;

      const widthVal = style.getPropertyValue("--partpage_width") || "50%";
      const marginTop = style.getPropertyValue("--partpage_top_margin");
      const marginLeft = style.getPropertyValue("--partpage_left_margin");
      const marginBottom = style.getPropertyValue("--partpage_bottom_margin");
      const marginRight = style.getPropertyValue("--partpage_right_margin");
      const paddingTop = style.getPropertyValue("--partpage_top_padding");
      const paddingBottom = style.getPropertyValue("--partpage_bottom_padding");
      var globalMarginTop = globalStyle?.getPropertyValue("--partpage_top_margin") ?? "";
      var globalMarginBottom = globalStyle?.getPropertyValue("--partpage_bottom_margin") ?? "";
      const globalPaddingTop = globalStyle?.getPropertyValue("--partpage_top_padding") ?? "";
      const globalPaddingBottom = globalStyle?.getPropertyValue("--partpage_bottom_padding") ?? "";

      newWidth.value = unitToValue(widthVal);
      newWidth.isSelected = hasPixel(widthVal);

      if (classList.contains("templateleft")) {
        width.type = TemplateWidthTypes.Left;
      } else if (classList.contains("templatecenter")) {
        width.type = TemplateWidthTypes.Center;
      } else if (classList.contains("templateright")) {
        width.type = TemplateWidthTypes.Right;
      } else {
        width.type = TemplateWidthTypes.Full;
      }

      left.value = unitToValue(marginLeft);
      left.isSelected = hasPixel(marginLeft);

      right.value = unitToValue(marginRight);
      right.isSelected = hasPixel(marginRight);

      var roundTop = Math.round(toNumber(globalMarginTop));
      var roundBottom = Math.round(toNumber(globalMarginBottom));
      if (marginTop !== "") {
        top.value = unitToValue(marginTop);
        top.isSelected = true;
        globalTop.value = false;

        if (paddingTop === "") {
          pTop.value = unitToValue(globalPaddingTop);
        }
      } else if (toNumber(globalMarginTop) !== 0) {
        top.value = unitToValue(roundTop.toString());
        top.isSelected = false;
        globalTop.value = true;
        if (toNumber(globalPaddingTop) !== 0) {
          pTop.value = unitToValue(globalPaddingTop);
        }
      }

      if (paddingTop !== "") {
        pTop.value = unitToValue(paddingTop);
        pTop.isSelected = false;
        if (marginTop === "") {
          top.value = unitToValue(roundTop.toString());
        }
      } else if (toNumber(globalPaddingTop) !== 0) {
        top.value = unitToValue(globalPaddingTop);
        top.isSelected = false;
        if (toNumber(globalMarginTop) !== 0) {
          top.value = unitToValue(roundTop.toString());
          top.isSelected = false;
        }
      }

      if (marginBottom !== "") {
        bottom.value = unitToValue(marginBottom);
        bottom.isSelected = true;
        globalTop.value = false;
        if (paddingBottom === "") {
          pBottom.value = unitToValue(globalPaddingBottom);
        }
      } else if (paddingBottom !== "") {
        pBottom.value = unitToValue(paddingBottom);
        pBottom.isSelected = false;
        if (marginBottom === "") {
          bottom.value = unitToValue(roundBottom.toString());
        }
      } else if (toNumber(globalMarginBottom) !== 0) {
        bottom.value = unitToValue(roundBottom.toString());
        bottom.isSelected = true;
        globalTop.value = true;
        if (toNumber(globalPaddingBottom) !== 0) {
          pBottom.value = unitToValue(globalPaddingBottom);
        }
      } else if (toNumber(globalPaddingBottom) !== 0) {
        pBottom.value = unitToValue(globalPaddingBottom);
        pBottom.isSelected = false;

        if (toNumber(globalMarginBottom) !== 0) {
          bottom.value = unitToValue(roundBottom.toString());
          bottom.isSelected = false;
        }
      }

      size.hasInnerContainer = true;
    } else {
      size.hasInnerContainer = false;
    }
  }

  return size;
}
