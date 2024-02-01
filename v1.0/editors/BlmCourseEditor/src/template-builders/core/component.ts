import { BaseComponent, BLMElement } from "types";
import { getHTMLElement } from "./html";

export function setComponentBy<P = object, Q = object, R = string>(
  component: BaseComponent<R>,
  element: BLMElement<P, Q>
) {
  component.id = element.id;
  component.mapping = element.mapping;
  component.isEditable = element.isEditable;
  component.isDeletable = element.isDeletable;
  component.isDeactivated = element.isDeactivated;
}

export function setComputedStyles<T>(parent: HTMLElement, components: BaseComponent<T>[]) {
  for (let component of components) {
    if (component.id) {
      const element = getHTMLElement(parent, `[blm-id='${component.id.toString()}']`);

      if (element) {
        component.frameStyle = window.getComputedStyle(element);
      }
    }
  }
}
