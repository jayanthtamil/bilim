import { CourseElementTemplate, ContentTemplate, TemplateRepeater } from "types";
import { createHTMLElement, isButtonRepeater, isMediaRepeater, isSoundRepeater } from "utils";
import { getStyleElementRules } from "../../core";
import { GlTemplateBuilderStore } from "../../store";
import {
  getAllButtonComponent,
  getAllMediaComponent,
  getAllRepeaterComponent,
  getAllTextComponent,
  getAllSoundComponent,
  getRelativeStyles,
} from "../component";

export function getContentTemplateModel(template: CourseElementTemplate) {
  const { html, template: associated } = template;
  const content = new ContentTemplate();
  const element = createHTMLElement(html);

  if (element) {
    GlTemplateBuilderStore.setTemplate(template);

    const rules = getStyleElementRules(element);

    content.texts = getTextComponents(element);
    content.medias = getMediaComponents(element);
    content.buttons = getButtonComponents(element);
    content.sounds = getSoundComponents(element);
    content.repeater = getRepeaterComponents(element);

    if (rules) {
      getRelativeStyles(rules, associated.name, content.medias);
    }

    GlTemplateBuilderStore.setTemplate(undefined);
  }

  return content;
}

function getTextComponents(root: HTMLElement) {
  return getAllTextComponent(root, `[blm-component="text"]`);
}

function getMediaComponents(root: HTMLElement) {
  return getAllMediaComponent(root, `:not([blm-component="repeater"]) > [blm-component="media"]`);
}

function getButtonComponents(root: HTMLElement) {
  return getAllButtonComponent(root, `:not([blm-component="repeater"]) > [blm-component="button"]`);
}

function getSoundComponents(root: HTMLElement) {
  return getAllSoundComponent(root, `:not([blm-component="repeater"]) > [blm-component="audio"]`);
}

function getRepeaterComponents(root: HTMLElement) {
  const repeaters = getAllRepeaterComponent(root, `[blm-component="repeater"]`);
  const result = new TemplateRepeater();

  for (const repeater of repeaters) {
    if (isMediaRepeater(repeater)) {
      result.medias = [...(result.medias ?? []), repeater];
    } else if (isButtonRepeater(repeater)) {
      result.buttons = [...(result.buttons ?? []), repeater];
    } else if (isSoundRepeater(repeater)) {
      result.sounds = [...(result.sounds ?? []), repeater];
    }
  }

  return result;
}
