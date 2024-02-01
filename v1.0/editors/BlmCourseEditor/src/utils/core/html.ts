import { MouseEvent } from "react";
import { SimpleObject } from "types";
import { camelToKebab } from "./common";

export function getElementPositionInWindow(element: HTMLElement, parent?: HTMLElement) {
  var xPosition = 0;
  var yPosition = 0;

  while (element && !(parent && (element === parent || element.contains(parent)))) {
    xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft;
    yPosition += element.offsetTop - element.scrollTop + element.clientTop;

    element = element.offsetParent as HTMLElement;
  }
  return { x: xPosition, y: yPosition };
}

export const createDocument = (str: string) => {
  const dom = new DOMParser();
  const doc = dom.parseFromString(str, "text/html");

  return doc;
};

export const addClassToString = (str: string, clsList: string[], selector?: string) => {
  if (str && clsList) {
    const root = createHTMLElement(str);
    const element = root && selector ? getElementBySelector(root, selector) : root;

    if (root && element) {
      for (let cls of clsList) {
        if (!element.classList.contains(cls)) {
          element.classList.add(cls);
        }
      }

      return root.outerHTML;
    }
  }

  return str;
};

export const removeClassFromString = (str: string, clsList: string[], selector?: string) => {
  if (str && clsList) {
    const root = createHTMLElement(str);
    const element = root && selector ? getElementBySelector(root, selector) : root;

    if (root && element) {
      for (let cls of clsList) {
        if (element.classList.contains(cls)) {
          element.classList.remove(cls);
        }
      }

      return root.outerHTML;
    }
  }

  return str;
};

export const getAttributeFromString = (
  str: string | HTMLElement,
  attribute: string,
  selector?: string
) => {
  if (str && attribute) {
    const root = createHTMLElement(str);
    const element = root && selector ? getElementBySelector(root, selector) : root;

    if (element) {
      return element.getAttribute(attribute);
    }
  }

  return null;
};

export const toggleAttributeInString = (
  str: string | HTMLElement,
  attributes: SimpleObject,
  selector?: string
) => {
  if (str && attributes) {
    const root = createHTMLElement(str);
    const element = root && selector ? getElementBySelector(root, selector) : root;

    if (root && element) {
      for (const attr in attributes) {
        const value = attributes[attr];

        if (value !== undefined) {
          element.setAttribute(attr, value);
        } else {
          element.removeAttribute(attr);
        }
      }

      return root.outerHTML;
    }
  }

  return typeof str === "string" ? str : str.outerHTML;
};

export const copyAttributesInString = (
  source: string | HTMLElement,
  destination: string | HTMLElement,
  attributes: string[],
  selector?: string
) => {
  if (source && destination) {
    const rootSrc = createHTMLElement(source);
    const rootDes = createHTMLElement(destination);
    const srcEle = rootSrc && selector ? getElementBySelector(rootSrc, selector) : rootSrc;
    const desEle = rootDes && selector ? getElementBySelector(rootDes, selector) : rootDes;

    if (rootDes && srcEle && desEle) {
      attributes.forEach((attr) => {
        const value = srcEle.getAttribute(attr);

        if (value !== null && value !== undefined) {
          desEle.setAttribute(attr, value);
        }
      });

      return rootDes.outerHTML;
    }
  }

  return typeof destination === "string" ? destination : destination.outerHTML;
};

export const getElementBySelector = (element: string | HTMLElement, selector: string) => {
  if (element && selector) {
    const root = typeof element === "string" ? createHTMLElement(element) : element;

    if (root?.matches(selector)) {
      return root;
    } else if (root) {
      return root.querySelector(selector) as HTMLElement;
    }
  }

  return null;
};

export const removeElementInString = (str: string | HTMLElement, selector: string) => {
  if (str && selector) {
    const root = typeof str === "string" ? createHTMLElement(str) : str;
    const element = root && getElementBySelector(root, selector);

    if (root && element && element.parentElement) {
      element.parentElement?.removeChild(element);

      return root.outerHTML;
    }
  }

  return typeof str === "string" ? str : str.outerHTML;
};

export const createHTMLElement = (str: string | HTMLElement) => {
  if (typeof str === "string" && str !== "") {
    const doc = createDocument(str);

    return doc.body.firstElementChild as HTMLElement;
  } else if (str) {
    return str;
  }

  return null;
};

export const decodeHTML = (html: string) => {
  const doc = createDocument("<div></div>");
  var txt = doc.createElement("textarea");
  txt.innerHTML = html;

  return txt.value;
};

export const removeAllChildren = (element: HTMLElement) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

export const updateInnerHTML = (html: string, selector: string, innerHtml: string) => {
  if (html) {
    const root = createHTMLElement(html);

    if (root) {
      const element = root.querySelector(selector);

      if (element) {
        element.innerHTML = innerHtml;
      }

      return root.outerHTML;
    }
  }

  return html;
};

export function getParentIFrame(element: HTMLElement) {
  const doc = element.ownerDocument;
  const win = doc.defaultView; // || doc.parentWindow;

  if (win?.frameElement) {
    return win?.frameElement as HTMLIFrameElement;
  }
}

export function getIFrameClientRect(element: HTMLElement) {
  if (element) {
    const frame = getParentIFrame(element);

    if (frame) {
      return frame.getBoundingClientRect();
    }
  }

  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };
}

export function getIFrameElementClientRect(element: HTMLElement) {
  const frameRect = getIFrameClientRect(element);
  const rect = element.getBoundingClientRect();

  return {
    x: frameRect.x + rect.x,
    y: frameRect.y + rect.y,
    width: rect.width,
    height: rect.height,
    top: frameRect.top + rect.top,
    left: frameRect.left + rect.left,
    bottom: frameRect.top + rect.bottom,
    right: frameRect.left + rect.right,
  };
}

export function hasPixel(str: string) {
  return str.endsWith("px");
}

export function unitToValue(value: string) {
  return parseInt(value || "0", 10).toString();
}

export function valueToUnit(value?: string | number, isPixel: boolean = true) {
  return (value || "0") + (isPixel ? "px" : "%");
}

export function updateStyleInnerHTML(style: HTMLStyleElement) {
  const rules = style.sheet?.cssRules;

  if (rules) {
    style.innerHTML = Array.from(rules).reduce((str, rule) => (str += "\n" + rule.cssText), "");
  }
}

export function isElementVisibleInFrame(element: HTMLElement, partial = true) {
  const frame = getParentIFrame(element);
  const rect1 = { top: 0, bottom: frame?.clientHeight || 0 };
  const rect2 = element.getBoundingClientRect();

  //Check if in view
  const isTotal = rect1.top <= rect2.top && rect2.bottom <= rect1.bottom;
  const isPartial =
    partial &&
    ((rect2.top < rect1.top && rect1.top < rect2.bottom) ||
      (rect2.top < rect1.bottom && rect1.bottom < rect2.bottom));

  return isTotal || isPartial;
}

export function getMouseRelativePos(event: MouseEvent<HTMLElement>, element?: HTMLElement) {
  const target = element || event.currentTarget;
  const bounds = target.getBoundingClientRect();

  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
}

export function getStyleSheet(doc: Document, filename: string) {
  for (let i = 0; i < doc.styleSheets.length; i++) {
    const sheet = doc.styleSheets[i];

    if (sheet.href?.endsWith(filename)) return sheet;
  }
}

//Now returned rule matched against simple, combined and group selector.
//Todo: we have to match other type of selector if needed.
export function getStyleSheetRule(sheet: CSSStyleSheet, selector: string) {
  const rules = sheet.cssRules;

  return Array.from(rules).reduce((result: CSSRule | undefined, rule) => {
    //rule instanceOf CSSStyleRule condition not working in chrome
    if ("selectorText" in rule) {
      const obj = rule as CSSStyleRule;

      if (obj.selectorText.match(selector)) {
        const arr = obj.selectorText.split(",");

        if (arr.some((str) => str.endsWith(selector))) {
          if (!result) {
            result = obj;
          } else {
            copyCSSStyleDeclarations(obj.style, (result as CSSStyleRule).style);
          }
        }
      }
    }

    return result;
  }, undefined);
}

function copyCSSStyleDeclarations(source: CSSStyleDeclaration, target: CSSStyleDeclaration) {
  for (let i = 0; i < source.length; i++) {
    const key = source.item(i);
    const value = source.getPropertyValue(key);

    target.setProperty(key, value);
  }
}

export function createStyleStrFromObj(obj: SimpleObject) {
  const arr = [];

  for (const key in obj) {
    const value = obj[key];

    arr.push(`${camelToKebab(key)}: ${value};`);
  }

  return arr.join(" ");
}

export function stringifyAttr(attr: string, value?: Object) {
  if (value) {
    return `${attr}='${JSON.stringify(value)}'`;
  }

  return "";
}

export function textArea(str: string, replaceFirst: string, replaceSecond: string) {
  return str.replaceAll(replaceFirst, replaceSecond);
};
