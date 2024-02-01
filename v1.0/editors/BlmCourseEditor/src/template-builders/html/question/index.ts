import { QuestionTemplate, CourseElementTemplate } from "types";
import { createHTMLElement, isQuestionCustom } from "utils";
import { getStyleElementRules, setStyleSheetHTML } from "template-builders/core";
import { setRelativeStyles, setStyleSheetRules } from "../component";
import { setQuestionFeedbackHTML } from "./feedback";
import { setQuestionIntroductionHTML } from "./introduction";
import { setQuestionMainHTML } from "./main";
import { setQuestionParametersHTML } from "./parameters";

export function setQuestionTemplateHTML(
  template: CourseElementTemplate,
  question: QuestionTemplate
) {
  const { html, template: associated } = template;
  const element = createHTMLElement(html);
  const { type, introduction, main, feedback, parameters } = question;

  if (element) {
    const rules = getStyleElementRules(element);

    setQuestionIntroductionHTML(element, introduction);
    setQuestionMainHTML(element, main, introduction, type);
    setQuestionFeedbackHTML(element, feedback, main);
    setQuestionParametersHTML(element, parameters);

    if (rules && isQuestionCustom(main.content)) {
      setStyleSheetRules(element, associated.name, rules);
      setRelativeStyles(rules, [main.content]);
      setStyleSheetHTML(element);
    }

    return element.outerHTML;
  }

  return html;
}
