import { BLMElement, TextComponent } from "types";
import { setBLMElementBy } from "../../core";

export function setTextComponent(
  parent: HTMLElement,
  selector: string,
  text: TextComponent,
  options?: Partial<Omit<BLMElement, "text">>
) {
  if (text.isEditable) {
    const model = createText(text, options);

    setBLMElementBy(parent, selector, model);
  }
}

function createText(text: TextComponent, options?: Partial<Omit<BLMElement, "text">>) {
  let model = new BLMElement();
  model.innerHTML = text.value || "";
  model.isDeactivated = text.isDeactivated;

  if (options) {
    model = { ...model, ...options };
  }

  return model;
}
