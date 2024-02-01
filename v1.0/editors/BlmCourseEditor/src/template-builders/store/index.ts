import {
  CourseElementTemplate,
  StyleList,
  StyleListCategory,
  StyleListItem,
  StyleListItems,
} from "types";
import { StyleListTypes } from "editor-constants";
import { getStyleSheet, getStyleSheetRule } from "utils";
import { createTint } from "../core";

export const GlTemplateBuilderStore = (() => {
  let template: CourseElementTemplate | undefined;
  let styles: StyleList | undefined;
  let isUpdated = false;

  const store = {
    setTemplate: (pTemplate?: CourseElementTemplate) => (template = pTemplate),
    getTemplate: () => template,
    setStyles: (pStyles: StyleList) => (styles = pStyles),
    getStyles: () => styles,
    updateStyles: (element: HTMLElement, filename: string) => {
      if (!isUpdated && styles) {
        const sheet = getStyleSheet(element.ownerDocument, filename);

        if (sheet) {
          for (const key in styles) {
            const style = styles[key as StyleListTypes];

            if (style) {
              const updateItems = (items: StyleListItems) => {
                items.forEach((item: StyleListCategory | StyleListItem) => {
                  if ("items" in item) {
                    updateItems(item.items);
                  } else {
                    const rule = getStyleSheetRule(sheet, item.className) as CSSStyleRule;

                    if (rule) {
                      item.tint = createTint(rule.style, "--blm_tint_color", "--blm_tint_opacity");
                      item.bgTint = createTint(
                        rule.style,
                        "--blm_undertext_color",
                        "--blm_undertext_opacity"
                      );
                      item.tintOut = createTint(rule.style, "--tintout", "--opacityout");
                      item.tintOver = createTint(rule.style, "--tintover", "--opacityover");
                    }
                  }
                });
              };

              updateItems(style.items);
            }
          }

          isUpdated = true;
        }
      }
    },
    getStyleItem: (styleName: string) => {
      if (styles) {
        for (const key in styles) {
          const style = styles[key as StyleListTypes];

          if (style) {
            if (style.classNames.includes(styleName)) {
              return style.map[styleName];
            }
          }
        }
      }
    },
  };

  return Object.freeze(store);
})();
