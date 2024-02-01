import { BLMElement, RepeaterComponent, RepeaterConfigJSON } from "types";
import { createUUID, isButtonRepeater, isMediaRepeater, isSoundRepeater } from "utils";
import { getAllHTMLElements, getBLMElement, setComponentBy } from "../../core";
import { getAllButtonComponent } from "./button";
import { getAllMediaComponent } from "./media";
import { getAllSoundComponent } from "./sound";

export function getAllRepeaterComponent(parent: HTMLElement, selector: string) {
  const elements = getAllHTMLElements(parent, selector);
  const repeaters = [];

  for (const element of elements) {
    const model = getBLMElement<RepeaterConfigJSON>(element);
    const repeater = createRepater(element, model);

    repeaters.push(repeater);
  }

  return repeaters;
}

function createRepater(parent: HTMLElement, element?: BLMElement<RepeaterConfigJSON>) {
  const component = new RepeaterComponent();
  const { style } = parent;

  if (element) {
    const { options } = element;

    setComponentBy(component, element);

    if (options) {
      const {
        allowcomponent,
        min_items,
        max_items,
        default_class,
        repeater_options,
        media_options,
        duplicate,
        saveincss,
      } = options;

      component.id = createUUID();
      component.allowComponent = allowcomponent;
      component.minimum = min_items;
      component.maximum = max_items;
      component.defaultClass = default_class;
      component.options = repeater_options;

      for (let i = 0; i < style.length; i++) {
        const key = style.item(i);
        const value = style.getPropertyValue(key);

        if (key.startsWith("--")) {
          component.variables = { ...component.variables, [key]: value };
        }
      }

      if (isMediaRepeater(component)) {
        component.mediaConfig = media_options;
        component.saveInCSS = saveincss || false;
        component.value = getAllMediaComponent(parent, `[blm-component="media"]`, component.id);
      } else if (isButtonRepeater(component)) {
        component.duplicate = duplicate;
        component.value = getAllButtonComponent(parent, `[blm-component="button"]`, component.id);
      } else if (isSoundRepeater(component)) {
        component.value = getAllSoundComponent(parent, `[blm-component="audio"]`, component.id);
      }
    }
  }

  return component;
}
