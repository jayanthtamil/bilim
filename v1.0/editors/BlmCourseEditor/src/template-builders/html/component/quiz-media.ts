import { ClassAttribute, BLMElement, LinkMedia, QuestionMediaComponent, MediaFile } from "types";
import { MediaOptionTypes } from "editor-constants";
import { isVideo } from "utils";
import { getHTMLElement, setBLMElementBy } from "../../core";

export function setQuestionMediaComponent(
  parent: HTMLElement,
  selector: string,
  media: QuestionMediaComponent<MediaFile>
) {
  const { value, isEditable } = media;

  if (isEditable) {
    const model = createQuestionMedia(value);
    const element = getHTMLElement(parent, selector);

    if (element) {
      setBLMElementBy(parent, selector, model);
      setMediaHTML(element, value);
    }
  }
}

function createQuestionMedia(media?: MediaFile) {
  const model = new BLMElement();

  if (media) {
    model.option = MediaOptionTypes.Media;
    model.editorOptions = media;
  } else {
    model.option = MediaOptionTypes.None;
    model.editorOptions = null;
  }

  return model;
}

export function setLinkMediaComponent(
  parent: HTMLElement,
  selector: string,
  component: QuestionMediaComponent<LinkMedia>,
  source?: MediaFile,
  classAttr?: ClassAttribute
) {
  const { value, isEditable } = component;

  if (isEditable && value) {
    const file = value.option !== MediaOptionTypes.None ? value.media || source : undefined;
    const isLinked = file === source;
    const media = createLinkMedia(value, isLinked, file);
    const element = getHTMLElement(parent, selector);

    media.classAttr = classAttr;

    if (element) {
      setBLMElementBy(parent, selector, media);
      setMediaHTML(element, file);
    }
  }
}

function createLinkMedia(data: LinkMedia, isLinked: boolean, media?: MediaFile | null) {
  const model = new BLMElement();

  if (media) {
    model.option = isLinked ? MediaOptionTypes.Linked : MediaOptionTypes.Media;
    model.editorOptions = data;
  } else {
    model.option = data.option;
    model.editorOptions = data;
  }

  return model;
}

function setMediaHTML(element: HTMLElement, file?: MediaFile) {
  if (file) {
    const { name, type, url } = file;

    if (isVideo(type)) {
      element.innerHTML = `
          <video>
            <source src="${url}" type="${type}"></source>
            Your browser does not support the video tag.
          </video>
          `;
    } else {
      element.innerHTML = `
            <img src="${url}" blm-originalfilename="${name}"></img>
          `;
    }
  } else {
    element.innerHTML = `
        <img src=""></img>
      `;
  }
}
