import { Dispatch } from "react";

import {
  QuestionTemplate,
  QuestionIntroduction,
  QuestionMain,
  QuestionPropositions,
  QuestionProposition,
  QuestionFeedback,
  QuestionParameters,
  MediaFile,
  QuestionCustomComponent,
} from "types";

export interface QuestionEditorState {
  data: QuestionTemplate | null;
  oldMedias: MediaFile[];
  isEdited: boolean;
}

export const INIT_QUESTION_EDITOR_DATA = "INIT_QUESTION_EDITOR_DATA";
export const UPDATE_QUESTION_EDITOR_DATA = "UPDATE_QUESTION_EDITOR_DATA";
export const UPDATE_QUESTION_INTRODUCTION_DATA = "UPDATE_QUESTION_INTRODUCTION_DATA";
export const UPDATE_QUESTION_MAIN_DATA = "UPDATE_QUESTION_MAIN_DATA";
export const UPDATE_QUESTION_PROPOSITIONS_DATA = "UPDATE_QUESTION_PROPOSITIONS_DATA";
export const ADD_QUESTION_PROPOSITION_DATA = "ADD_QUESTION_PROPOSITION_DATA";
export const UPDATE_QUESTION_PROPOSITION_DATA = "UPDATE_QUESTION_PROPOSITION_DATA";
export const DELETE_QUESTION_PROPOSITION_DATA = "DELETE_QUESTION_PROPOSITION_DATA";
export const UPDATE_QUESTION_CUSTOM_DATA = " UPDATE_QUESTION_CUSTOM_DATA";
export const UPDATE_QUESTION_FEEDBACK_DATA = "UPDATE_QUESTION_FEEDBACK_DATA";
export const UPDATE_QUESTION_PARAMETERS_DATA = "UPDATE_QUESTION_PARAMETERS_DATA";

export type InitQuestionEditorAction = {
  type: typeof INIT_QUESTION_EDITOR_DATA;
  payload: QuestionTemplate;
};

export type UpdateQuestionEditorAction = {
  type: typeof UPDATE_QUESTION_EDITOR_DATA;
  payload: QuestionTemplate;
};

export type UpdateQuestionIntroductionAction = {
  type: typeof UPDATE_QUESTION_INTRODUCTION_DATA;
  payload: QuestionIntroduction;
};

export type UpdateQuestionMainAction = {
  type: typeof UPDATE_QUESTION_MAIN_DATA;
  payload: QuestionMain;
};

export type UpdateQuestionPropositionsAction = {
  type: typeof UPDATE_QUESTION_PROPOSITIONS_DATA;
  payload: QuestionPropositions;
};

export type AddQuestionPropositionAction = {
  type: typeof ADD_QUESTION_PROPOSITION_DATA;
  payload: QuestionProposition;
};

export type UpdateQuestionPropositionAction = {
  type: typeof UPDATE_QUESTION_PROPOSITION_DATA;
  payload: QuestionProposition;
};

export type DeleteQuestionPropositionAction = {
  type: typeof DELETE_QUESTION_PROPOSITION_DATA;
  payload: QuestionProposition;
};

export type UpdateQuestionCustomAction = {
  type: typeof UPDATE_QUESTION_CUSTOM_DATA;
  payload: QuestionCustomComponent;
};

export type UpdateQuestionFeedbackAction = {
  type: typeof UPDATE_QUESTION_FEEDBACK_DATA;
  payload: QuestionFeedback;
};

export type UpdateQuestionParametersAction = {
  type: typeof UPDATE_QUESTION_PARAMETERS_DATA;
  payload: QuestionParameters;
};

export type QuestionEditorActions =
  | InitQuestionEditorAction
  | UpdateQuestionEditorAction
  | UpdateQuestionIntroductionAction
  | UpdateQuestionMainAction
  | UpdateQuestionPropositionsAction
  | AddQuestionPropositionAction
  | UpdateQuestionPropositionAction
  | DeleteQuestionPropositionAction
  | UpdateQuestionCustomAction
  | UpdateQuestionFeedbackAction
  | UpdateQuestionParametersAction;

export type QuestionEditorDispatch = Dispatch<QuestionEditorActions>;
