import { BaseComponent } from "types";
import { MediaFormats } from "editor-constants";
import { isMediaComponent, toNumber } from "utils";

export function getRelativeStyles<T>(
  rules: CSSRuleList,
  name: string,
  ...components: BaseComponent<T>[][]
) {
  components.flat().forEach((component) => {
    if (isMediaComponent(component)) {
      const {
        id,
        format: { value },
      } = component;
      const root = new RegExp(`^.(rt-etr-\\w+|q?${name}\\w?)$`);
      const relative = new RegExp(
        `^.(rt-etr-\\w+|q?${name}\\w?) div \\[blm-id="${id}"\\].relativeheight$`
      );

      Array.from(rules).forEach((rule) => {
        if (rule instanceof CSSStyleRule) {
          const { selectorText, style } = rule;

          if (
            (component.config?.saveInCSS && root.test(selectorText)) ||
            relative.test(selectorText)
          ) {
            const val = toNumber(style.getPropertyValue(`--media-height-${id}`));

            if (!isNaN(val)) {
              component.format.defaultHeight = val;

              if (value === MediaFormats.RelativeHeight) {
                component.format.height = val;
              }
            }
          }
        }
      });
    }
  });
}
