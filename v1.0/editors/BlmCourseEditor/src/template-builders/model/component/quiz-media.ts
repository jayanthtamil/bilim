import { BLMElement, QuestionMediaComponent, MediaFile } from "types";
import { MediaOptionTypes } from "editor-constants";
import { getBLMElementBy, setComponentBy } from "../../core";

export function getQuestionMediaComponent<P = MediaFile>(
  parent: HTMLElement,
  selector: string,
  isLinkMedia: boolean = false
) {
  const model = getBLMElementBy<object, P>(parent, selector);

  return createMedia(model, isLinkMedia);
}

function createMedia<P = MediaFile>(model?: BLMElement<object, P>, isLinkMedia: boolean = false) {
  const component = new QuestionMediaComponent<P>();

  if (model) {
    const { option, editorOptions } = model;

    setComponentBy(component, model);

    if (option && editorOptions) {
      if (isLinkMedia || option !== MediaOptionTypes.None) {
        component.value = editorOptions;
      }
    }
  }

  return component;
}
