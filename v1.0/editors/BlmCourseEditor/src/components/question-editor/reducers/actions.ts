import {
  QuestionTemplate,
  QuestionIntroduction,
  QuestionMain,
  QuestionPropositions,
  QuestionProposition,
  QuestionFeedback,
  QuestionParameters,
  QuestionCustomComponent,
} from "types";
import * as types from "./types";

export function initQuestionEditor(data: QuestionTemplate): types.InitQuestionEditorAction {
  return {
    type: types.INIT_QUESTION_EDITOR_DATA,
    payload: data,
  };
}

export function updateQuestionEditor(data: QuestionTemplate): types.UpdateQuestionEditorAction {
  return {
    type: types.UPDATE_QUESTION_EDITOR_DATA,
    payload: data,
  };
}

export function updateQuestionIntroduction(
  data: QuestionIntroduction
): types.UpdateQuestionIntroductionAction {
  return {
    type: types.UPDATE_QUESTION_INTRODUCTION_DATA,
    payload: data,
  };
}

export function updateQuestionMain(data: QuestionMain): types.UpdateQuestionMainAction {
  return {
    type: types.UPDATE_QUESTION_MAIN_DATA,
    payload: data,
  };
}

export function updateQuestionPropositions(
  data: QuestionPropositions
): types.UpdateQuestionPropositionsAction {
  return {
    type: types.UPDATE_QUESTION_PROPOSITIONS_DATA,
    payload: data,
  };
}

export function addQuestionProposition(
  data: QuestionProposition
): types.AddQuestionPropositionAction {
  return {
    type: types.ADD_QUESTION_PROPOSITION_DATA,
    payload: data,
  };
}

export function updateQuestionProposition(
  data: QuestionProposition
): types.UpdateQuestionPropositionAction {
  return {
    type: types.UPDATE_QUESTION_PROPOSITION_DATA,
    payload: data,
  };
}

export function deleteQuestionProposition(
  data: QuestionProposition
): types.DeleteQuestionPropositionAction {
  return {
    type: types.DELETE_QUESTION_PROPOSITION_DATA,
    payload: data,
  };
}

export function updateQuestionCustom(
  data: QuestionCustomComponent
): types.UpdateQuestionCustomAction {
  return {
    type: types.UPDATE_QUESTION_CUSTOM_DATA,
    payload: data,
  };
}

export function updateQuestionFeedback(data: QuestionFeedback): types.UpdateQuestionFeedbackAction {
  return {
    type: types.UPDATE_QUESTION_FEEDBACK_DATA,
    payload: data,
  };
}

export function updateQuestionParameters(
  data: QuestionParameters
): types.UpdateQuestionParametersAction {
  return {
    type: types.UPDATE_QUESTION_PARAMETERS_DATA,
    payload: data,
  };
}
