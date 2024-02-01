import { CourseElementTemplate, TemplateBase } from "types";
import { ElementType, TemplateTypes } from "editor-constants";
import { copyAttributesInString, differenceOfObjects } from "utils";
import { createElementTemplateHTML, getContentMedias, getQuestionMedias } from "../core";
import { getContentTemplateModel, getQuestionTemplateModel } from "../model";
import {
  copyMarginReplaceTemplate,
  copyPartPageBackground,
  copyScreenBackground,
} from "./background";
import { copyContentTemplate } from "./content";
import { copyQuestionTemplate } from "./question";

export function changeTemplateVariant(
  template: CourseElementTemplate,
  variant: TemplateBase,
  isDark: boolean,
  isRelative = true
) {
  const newTempalte = { ...template };
  const { type, templateType } = template;

  newTempalte.html = createElementTemplateHTML(variant.html, isDark, type as TemplateTypes);
  newTempalte.html = copyAttributesInString(
    template.html,
    newTempalte.html,
    ["blm-options", "blm-editor-options", "blm-scroll-transition", "anchor"],
    ".outercontainer"
  );

  newTempalte.isDarkTemplate = isDark;
  newTempalte.template = { ...variant };

  if (templateType === ElementType.PartPage || templateType === ElementType.SimplePartPage) {
    newTempalte.html = copyPartPageBackground(template, newTempalte);
  } else {
    newTempalte.html = copyScreenBackground(template, newTempalte);
  }

  if (templateType === ElementType.Question) {
    newTempalte.html = copyQuestionTemplate(template, newTempalte);
  } else {
    newTempalte.html = copyContentTemplate(template, newTempalte, isRelative);
  }

  newTempalte.html = copyMarginReplaceTemplate(template, newTempalte);

  return newTempalte;
}

export function getUnusedMedias(
  oldTemplate: CourseElementTemplate,
  newTemplate: CourseElementTemplate
) {
  if (oldTemplate.type === ElementType.Question) {
    const oldQuestion = getQuestionTemplateModel(oldTemplate);
    const newQuestion = getQuestionTemplateModel(newTemplate);
    const oldMedias = getQuestionMedias(oldQuestion);
    const newMedias = getQuestionMedias(newQuestion);

    return differenceOfObjects(oldMedias, newMedias, "id");
  } else {
    const oldContent = getContentTemplateModel(oldTemplate);
    const newContent = getContentTemplateModel(newTemplate);
    const oldMedias = getContentMedias(oldContent);
    const newMedias = getContentMedias(newContent);

    return differenceOfObjects(oldMedias, newMedias, "id");
  }
}
