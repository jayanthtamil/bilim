import { MediaFile, SoundComponent, SoundConfigJSON } from "types";
import { StyleListTypes } from "editor-constants";
import { getAllHTMLElements, getBLMElement, getHTMLElement, setComponentBy } from "../../core";
import { createComponentStyle } from "./common";

export function getAllSoundComponent(parent: HTMLElement, selector: string, repeaterId?: string) {
  const elements = getAllHTMLElements(parent, selector);
  const sounds = [];

  for (let element of elements) {
    const sound = createSound(element);
    sound.repeaterId = repeaterId;

    sounds.push(sound);
  }

  return sounds;
}

function createSound(element: HTMLElement) {
  const sound = new SoundComponent();
  const model = getBLMElement<
    SoundConfigJSON,
    Record<"media" | "image" | "subtitle" | "marker", MediaFile | undefined> | undefined
  >(element);
  const title = getHTMLElement(element, ".captionwrapper .title");
  const desc = getHTMLElement(element, ".captionwrapper .description");
  const caption = getHTMLElement(element, ".captionwrapper .caption");
  const { attributes, options, editorOptions } = model;
  const { value } = sound;

  setComponentBy(sound, model);

  sound.classList = Array.from(element.classList);
  sound.options = options || undefined;
  sound.hasApplyStyle = attributes?.["unapplystyle"] === undefined;

  value.media = editorOptions?.media;
  value.image = editorOptions?.image;

  if (value.media && editorOptions?.subtitle && editorOptions?.marker) {
    //For legacy code, we can remove after some times
    value.media.subtitle = editorOptions.subtitle;
    value.media.marker = editorOptions.marker;
  }

  value.title = title?.textContent || "";
  value.description = desc?.textContent || "";
  value.caption = caption?.textContent || "";
  value.autoPlay = options?.parameters?.autostart || false;
  value.localPlay = options?.parameters?.local !== undefined ? options?.parameters?.local : true;
  value.style = createComponentStyle(element, StyleListTypes.Sound, true);

  return sound;
}
