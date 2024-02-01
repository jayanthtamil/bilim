import { createShortUUID } from "utils";

export function setStyleSheetRules(
  rootDom: HTMLElement,
  name: string,
  rules?: CSSRuleList,
  duplicate?: string
) {
  if (!rules) {
    return;
  }

  let uuid = Array.from(rootDom.classList).find((cls) => cls.startsWith("rt-etr-"));

  if (duplicate) {
    Array.from(rootDom.classList).forEach((cls) => {
      if (cls.startsWith("rt-etr-")) {
        rootDom.classList.remove(cls);
        var previousClass = cls;
        uuid = "rt-etr-" + createShortUUID();

        setUUIDSelector(rules, name, uuid, previousClass);
        rootDom.classList.add(uuid);
      }
    });
  }

  if (!uuid && !duplicate) {
    uuid = "rt-etr-" + createShortUUID();

    setUUIDSelector(rules, name, uuid);
    rootDom.classList.add(uuid);
  }
}

const setUUIDSelector = (
  rules: CSSRuleList,
  name: string,
  uuid: string,
  previousClass?: string
) => {
  if (rules && name !== "") {
    Array.from(rules).forEach((rule) => {
      if (rule instanceof CSSStyleRule) {
        const reg = new RegExp(`q?${name}\\w?`, "gi");
        if (previousClass) {
          rule.selectorText = rule.selectorText.replaceAll(previousClass, uuid);
        }
        rule.selectorText = rule.selectorText.replaceAll(reg, uuid);
      } else if (rule instanceof CSSMediaRule) {
        setUUIDSelector(rule.cssRules, name, uuid, previousClass ?? undefined);
      }
    });
  }
};
