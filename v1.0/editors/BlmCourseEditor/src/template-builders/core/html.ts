import { Tint } from "types";
import { toNumber, updateStyleInnerHTML } from "utils";

export function getHTMLElement(parent: HTMLElement, selector: string): HTMLElement | null {
  return parent.querySelector(selector) as HTMLElement;
}

export function getAllHTMLElements(parent: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(parent.querySelectorAll(selector));
}

export function getComputedStyle(parent: HTMLElement, selector: string) {
  const element = getHTMLElement(parent, selector);

  if (element) {
    return window.getComputedStyle(element);
  }
}

export function getStyleElementRules(parent: HTMLElement) {
  const styles = parent.getElementsByTagName("style");

  if (styles.length) {
    const style = styles[0] as HTMLStyleElement;

    return style.sheet?.cssRules;
  }
}

export function setStyleSheetHTML(root: HTMLElement) {
  const styles = root.getElementsByTagName("style");

  if (styles.length) {
    const style = styles[0] as HTMLStyleElement;

    updateStyleInnerHTML(style);
  }
}

export function createTint(style: CSSStyleDeclaration, color: string, opacity: string) {
  const tint = new Tint();
  tint.color = style.getPropertyValue(color) || undefined;
  tint.alpha = toNumber(style.getPropertyValue(opacity));

  if (tint.color === "unset") {
    tint.color = undefined;
  }

  if (isNaN(tint.alpha)) {
    tint.alpha = undefined;
  } else {
    tint.alpha *= 100;
  }

  return tint.color !== undefined || tint.alpha !== undefined ? tint : undefined;
}
