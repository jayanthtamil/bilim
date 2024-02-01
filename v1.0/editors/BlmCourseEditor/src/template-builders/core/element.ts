import { Attributes, BLMElement, ClassAttribute, StyleAttribute } from "types";
import { createStyleStrFromObj, toCamelCase, toJSONObject } from "utils";
import { getAllHTMLElements, getHTMLElement } from "./html";

export function getAllBLMElementsBy<P = object, Q = object>(parent: HTMLElement, selector: string) {
  const elements = getAllHTMLElements(parent, selector);
  const models = [];

  for (const element of elements) {
    const model = getBLMElement<P, Q>(element);

    models.push(model);
  }

  return models;
}

export function getBLMElementBy<P = object, Q = object>(parent: HTMLElement, selector: string) {
  const element = getHTMLElement(parent, selector);

  if (element) {
    return getBLMElement<P, Q>(element);
  }
}

export function getBLMElement<P = object, Q = object>(element: HTMLElement) {
  const model = new BLMElement<P, Q>();

  if (element) {
    const { innerHTML, classList } = element;

    model.id = element.getAttribute("blm-id") ?? undefined;
    model.mapping = element.getAttribute("blm-mapping") ?? undefined;
    model.component = element.getAttribute("blm-component") ?? undefined;
    model.innerHTML = innerHTML;
    model.isEditable = element.hasAttribute("blm-editable");
    model.isDeletable = element.hasAttribute("blm-deletable");
    model.option = element.getAttribute("blm-option");
    model.options = toJSONObject<P>(element.getAttribute("blm-options"));

    model.editorOptions = toJSONObject<Q>(element.getAttribute("blm-editor-options"));
    model.isDeactivated = model.isDeletable ? classList.contains("deactivated") : undefined;
    model.attributes = getHTMLAttributes(element);
  }

  return model;
}

export function setBLMElementBy(parent: HTMLElement, selector: string, model: Partial<BLMElement>) {
  const element = getHTMLElement(parent, selector);

  if (element) {
    setBLMElement(element, model);
  }
}

export function setBLMElement(element: HTMLElement, model: Partial<BLMElement>) {
  if (element) {
    if (model.id) {
      setHTMLAttribute(element, "blm-id", model.id);
    }

    if (model.innerHTML !== undefined) {
      element.innerHTML = model.innerHTML;
    }

    if (model.option !== undefined) {
      setHTMLAttribute(element, "blm-option", model.option);
    }

    if (model.options !== undefined) {
      setHTMLAttribute(
        element,
        "blm-options",
        model.options ? JSON.stringify(model.options) : null
      );
    }

    if (model.editorOptions !== undefined) {
      setHTMLAttribute(
        element,
        "blm-editor-options",
        model.editorOptions ? JSON.stringify(model.editorOptions) : null
      );
    }

    if (model.attributes) {
      updateHTMLAttributes(element, model.attributes);
    }

    if (model.classAttr) {
      updateClassAttr(element, model.classAttr);
    }

    if (model.styleAttr) {
      updateStyleAttr(element, model.styleAttr);
    }

    if (model.isDeactivated !== undefined) {
      if (model.isDeactivated) {
        element.classList.add("deactivated");
      } else {
        element.classList.remove("deactivated");
      }
    }
  }
}

export function setHTMLAttribute(element: HTMLElement, attr: string, value: string | null) {
  if (element) {
    if (value) {
      if (value === "true") element.setAttribute(attr, "");
      else element.setAttribute(attr, value);
    } else if (element.hasAttribute(attr)) {
      element.removeAttribute(attr);
    }
    return element.outerHTML;
  }
}

function getHTMLAttributes(element: HTMLElement) {
  const { attributes } = element;
  const attrs = new Attributes();

  for (let i = 0; i < attributes.length; i++) {
    const { nodeName, nodeValue } = attributes[i];

    attrs[nodeName] = nodeValue;
  }

  return attrs;
}

function updateHTMLAttributes(element: HTMLElement, attributes: Attributes) {
  if (element && attributes) {
    const { removables, ...others } = attributes;

    if (removables) {
      for (const attr of removables) {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr);
        }
      }
    }

    if (others) {
      for (const attr in others) {
        element.setAttribute(attr, others[attr]);
      }
    }
  }
}

function updateClassAttr(element: HTMLElement, classAttr: ClassAttribute) {
  if (element) {
    const { classList } = element;
    const { items, removables } = classAttr;

    for (const cls of removables) {
      if (typeof cls === "string") {
        if (classList.contains(cls)) {
          classList.remove(cls);
        }
      } else {
        for (let i = 0; i < classList.length; i++) {
          const item = classList.item(i);

          if (item && cls.test(item)) {
            classList.remove(item);
          }
        }
      }
    }

    for (const cls of items) {
      if (!classList.contains(cls)) {
        classList.add(cls);
      }
    }
  }
}

function updateStyleAttr(element: HTMLElement, styleAttr: StyleAttribute) {
  if (element) {
    const { removables, ...styles } = styleAttr;
    const { style } = element;

    if (style) {
      for (let i = 0; i < style.length; i++) {
        const key = style.item(i);
        const value = style.getPropertyValue(key);
        const name = key.startsWith("--") ? key : toCamelCase(key);

        if (!removables.includes(name) && styles[name] === undefined) {
          styles[name] = value;
        }
      }
    }

    if (Object.keys(styles).length) {
      element.setAttribute("style", createStyleStrFromObj(styles));
    } else if (element.hasAttribute("style")) {
      element.removeAttribute("style");
    }
  }
}
