import { QuestionParameters, QuizParametersOptionsJSON } from "types";
import { setBLMElementBy } from "../../core";

export function setQuestionParametersHTML(root: HTMLElement, parameters: QuestionParameters) {
  const { relatedTo, weight, mandatory, eliminatory, useforscoring, timer } = parameters;
  const options: QuizParametersOptionsJSON = {
    relatedto: relatedTo,
    weight,
    mandatory,
    eliminatory,
    useforscoring,
    timer,
  };

  setBLMElementBy(root, "[id='options']", { options });
}
