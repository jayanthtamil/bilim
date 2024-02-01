import { CourseElementTemplate, QuestionTemplate } from "types";
import { QuestionTemplateTypes } from "editor-constants";
import { createHTMLElement, isQuestionCustom } from "utils";
import { getStyleElementRules } from "template-builders/core";
import { getRelativeStyles } from "../component";
import { getQuestionIntroduction } from "./introduction";
import { getQuestionMain } from "./main";
import { getQuestionFeedback } from "./feedback";
import { getQuestionParameters } from "./parameters";

export function getQuestionTemplateModel(template: CourseElementTemplate) {
  const { html, template: associated } = template;
  const question = new QuestionTemplate();
  const element = createHTMLElement(html);

  if (element) {
    const rules = getStyleElementRules(element);

    if (element.classList.contains("customquestion")) {
      question.type = element.classList.contains("noheader")
        ? QuestionTemplateTypes.NoHeader
        : QuestionTemplateTypes.Custom;
    }

    question.introduction = getQuestionIntroduction(element);
    question.main = getQuestionMain(element, question.type);
    question.feedback = getQuestionFeedback(element);
    question.parameters = getQuestionParameters(element);

    if (rules && isQuestionCustom(question.main.content)) {
      getRelativeStyles(rules, associated.name, [question.main.content]);
    }
  }

  return question;
}
