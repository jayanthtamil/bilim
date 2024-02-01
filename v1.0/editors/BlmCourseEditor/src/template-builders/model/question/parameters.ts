import { QuestionParameters, QuizParametersOptionsJSON } from "types";
import { getHTMLElement, getBLMElement } from "../../core";

export function getQuestionParameters(root: HTMLElement) {
  const parameters = new QuestionParameters();
  const element = getHTMLElement(root, "[id='options']");

  if (element) {
    const model = getBLMElement<QuizParametersOptionsJSON>(element);
    const { options } = model;

    if (options) {
      parameters.relatedTo = options.relatedto;
      parameters.weight = options.weight;
      parameters.mandatory = options.mandatory;
      parameters.eliminatory = options.eliminatory;
      parameters.useforscoring = options.useforscoring;
      parameters.timer = options.timer;
    }
  }

  return parameters;
}
