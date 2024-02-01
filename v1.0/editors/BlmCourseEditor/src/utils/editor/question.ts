import { QuestionCustomComponent, QuestionMain, QuestionPropositionsComponent } from "types";
import { ComponentTypes } from "editor-constants";

export function isQuestionPropositions(
  value: QuestionMain["content"]
): value is QuestionPropositionsComponent {
  return Boolean(value && value.type === ComponentTypes.Base);
}

export function isQuestionCustom(value: QuestionMain["content"]): value is QuestionCustomComponent {
  return Boolean(value && value.type === ComponentTypes.Media);
}
