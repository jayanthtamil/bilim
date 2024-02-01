import { MediaFormats } from "editor-constants";
import { BaseComponent } from "types";
import { isMediaComponent, isMediaRepeater, isRepeaterComponent } from "utils";

export function setRelativeStyles(rules: CSSRuleList, ...components: BaseComponent<any>[][]) {
  components.flat().forEach((component) => {
    if (isMediaComponent(component)) {
      const {
        id,
        format: { value, defaultHeight, height = defaultHeight },
        config,
      } = component;
      const root = new RegExp(`^.rt-etr-\\w+$`);
      const relative = new RegExp(`^.rt-etr-\\w+ div \\[blm-id="${id}"\\].relativeheight$`);

      Array.from(rules).forEach((rule) => {
        if (rule instanceof CSSStyleRule) {
          const { selectorText, style } = rule;

          if (config?.saveInCSS && root.test(selectorText)) {
            style.setProperty(`--media-height-${id}`, height + "px");
          } else if (value === MediaFormats.RelativeHeight && relative.test(selectorText)) {
            style.setProperty(`--media-height-${id}`, height.toString());
          }
        }
      });
    } else if (isRepeaterComponent(component) && isMediaRepeater(component)) {
      const { saveInCSS, value = [] } = component;
      const root = new RegExp(`^.rt-etr-\\w+$`);

      Array.from(rules).forEach((rule) => {
        if (rule instanceof CSSStyleRule) {
          const { selectorText, style } = rule;

          if (saveInCSS && root.test(selectorText)) {
            style.setProperty(`--nb-media`, value.length.toString());
          }
        }
      });
    }
  });
}
