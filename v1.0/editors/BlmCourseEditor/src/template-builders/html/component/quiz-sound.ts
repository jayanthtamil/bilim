import { BLMElement, QuestionMediaComponent, MediaFile } from "types";
import { MediaOptionTypes } from "editor-constants";
import { isAudio, removeAllChildren } from "utils";
import { getHTMLElement, setBLMElementBy } from "../../core";

export function setQuestionSoundComponent(
  parent: HTMLElement,
  selector: string,
  sound: QuestionMediaComponent<MediaFile>
) {
  const { value, isEditable } = sound;

  if (isEditable) {
    const model = createSound(value);
    const element = getHTMLElement(parent, selector);

    if (element) {
      setBLMElementBy(parent, selector, model);
      setSoundHTML(element, value);
    }
  }
}

function createSound(media?: MediaFile) {
  const model = new BLMElement();

  if (media) {
    model.option = MediaOptionTypes.Sound;
    model.editorOptions = media;
  } else {
    model.option = MediaOptionTypes.None;
    model.editorOptions = null;
  }

  return model;
}

function setSoundHTML(element: HTMLElement, file?: MediaFile) {
  if (file) {
    const { type, url, subtitle, marker } = file;

    if (isAudio(type)) {
      element.innerHTML = `
      <audio>
        <source src="${url}" type="${type}">${
        subtitle
          ? `\n\t<track label="english" kind="subtitles" srclang="en" src="${subtitle.url}" default/>`
          : ""
      }${
        marker
          ? `\n\t<track label="english" kind="chapters" srclang="en" src="${marker.url}"/>`
          : ""
      } 
        Your browser does not support the audio element.
      </audio>
      `;
    }
  } else {
    removeAllChildren(element);
  }
}
