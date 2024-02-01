import { BaseComponent, BLMElement } from "types";
import { TemplateEditorOptionTypes } from "editor-constants";
import { setBLMElementBy } from "../../core";

export function setSimpleContentComponent(
  parent: HTMLElement,
  selector: string,
  component: BaseComponent<string>
) {
  if (component.isEditable) {
    const model = createSimpleContent(component);

    setBLMElementBy(parent, selector, model);
  }
}

function createSimpleContent(component: BaseComponent<string>) {
  const { value } = component;
  const model = new BLMElement();

  model.option =
    value !== TemplateEditorOptionTypes.None
      ? `simplecontent(${value})`
      : TemplateEditorOptionTypes.None;

  return model;
}
