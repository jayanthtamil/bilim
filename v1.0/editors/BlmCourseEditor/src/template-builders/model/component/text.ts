import { BLMElement, TextComponent } from "types";
import { getAllBLMElementsBy, getBLMElementBy, setComponentBy } from "../../core";

export function getTextComponent(parent: HTMLElement, selector: string) {
  const model = getBLMElementBy(parent, selector);

  return createText(model);
}

export function getAllTextComponent(parent: HTMLElement, selector: string) {
  const models = getAllBLMElementsBy(parent, selector);
  const texts = [];

  for (let model of models) {
    const text = createText(model);

    texts.push(text);
  }

  return texts;
}

function createText(model?: BLMElement) {
  const text = new TextComponent();

  if (model) {
    const { innerHTML } = model;

    setComponentBy(text, model);

    text.value = innerHTML;
  }

  return text;
}
