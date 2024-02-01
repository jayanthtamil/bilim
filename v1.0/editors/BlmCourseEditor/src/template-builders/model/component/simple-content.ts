import { BaseComponent, BLMElement } from "types";
import { TemplateEditorOptionTypes } from "editor-constants";
import { getBLMElementBy, getSimpleContentId } from "../../core";

export function getSimpleContentComponent(parent: HTMLElement, selector: string) {
  const model = getBLMElementBy(parent, selector);

  return createSimpleContent(model);
}

function createSimpleContent(model?: BLMElement) {
  const simpleContent = new BaseComponent();

  if (model) {
    const { isEditable = true, option } = model;

    simpleContent.isEditable = isEditable;
    simpleContent.value = getSimpleContentId(option) || TemplateEditorOptionTypes.None;
  }

  return simpleContent;
}
