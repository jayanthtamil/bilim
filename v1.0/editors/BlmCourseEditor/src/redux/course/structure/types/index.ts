import { CourseStructure } from "types";
import { ApiResultAction } from "redux/types";

export interface StructureState {
  structure?: CourseStructure;
}

export interface ConnectionResponse {
  value: string;
}

export interface BaseAssociatedTemplateResponse {
  id: string;
  interaction: string;
  theme: string;
  framework_min: string;
  framework_max: string;
  course_context: string;
}

export interface ElementResponse {
  id: string;
  type: string;
  name: string;
  theme_ref: string | null;
  direct_evaluation: string | null;
  isevaluation: string | null;
  hasassociatecontent: string | null;
  hasfeedback: string | null;
  summary: string | null;
  styleSummary: string | null;
  template?: BaseAssociatedTemplateResponse;
  template_type: string | null;
  props_param?: string;
  htmlParam?: string;
  connections: ConnectionResponse[] | null;
  children: ElementResponse[];
}

export interface CourseStructureResponse {
  starting: [ElementResponse];
  structure: [ElementResponse];
  annexes: [ElementResponse];
}

export const GET_COURSE_STRUCTURE_STARTED = "GET_COURSE_STRUCTURE_STARTED";
export const GET_COURSE_STRUCTURE_SUCCESS = "GET_COURSE_STRUCTURE_SUCCESS";
export const GET_COURSE_STRUCTURE_ERROR = "GET_COURSE_STRUCTURE_ERROR";

export const CREATE_ELEMENT_STARTED = "CREATE_ELEMENT_STARTED";
export const CREATE_ELEMENT_SUCCESS = "CREATE_ELEMENT_SUCCESS";
export const CREATE_ELEMENT_ERROR = "CREATE_ELEMENT_ERROR";

export const RENAME_ELEMENT_STARTED = "RENAME_ELEMENT_STARTED";
export const RENAME_ELEMENT_SUCCESS = "RENAME_ELEMENT_SUCCESS";
export const RENAME_ELEMENT_ERROR = "RENAME_ELEMENT_ERROR";

export const UPDATE_ELEMENT_CONNECTION_STARTED = "UPDATE_ELEMENT_CONNECTIONS_STARTED";
export const UPDATE_ELEMENT_CONNECTION_SUCCESS = "UPDATE_ELEMENT_CONNECTIONS_SUCCESS";
export const UPDATE_ELEMENT_CONNECTION_ERROR = "UPDATE_ELEMENT_CONNECTIONS_ERROR";

export const UPDATE_ELEMENT_AUTO_SUMMARY_STARTED = "UPDATE_ELEMENT_AUTO_SUMMARY_STARTED";
export const UPDATE_ELEMENT_AUTO_SUMMARY_SUCCESS = "UPDATE_ELEMENT_AUTO_SUMMARY_SUCCESS";
export const UPDATE_ELEMENT_AUTO_SUMMARY_ERROR = "UPDATE_ELEMENT_AUTO_SUMMARY_ERROR";

export const UPDATE_ELEMENT_SUMMARY_STARTED = "UPDATE_ELEMENT_SUMMARY_STARTED";
export const UPDATE_ELEMENT_SUMMARY_SUCCESS = "UPDATE_ELEMENT_SUMMARY_SUCCESS";
export const UPDATE_ELEMENT_SUMMARY_ERROR = "UPDATE_ELEMENT_SUMMARY_ERROR";

export const DELETE_ELEMENT_STARTED = "DELETE_ELEMENT_STARTED";
export const DELETE_ELEMENT_SUCCESS = "DELETE_ELEMENT_SUCCESS";
export const DELETE_ELEMENT_ERROR = "DELETE_ELEMENT_ERROR";

export const DUPLICATE_ELEMENT_STARTED = "DUPLICATE_ELEMENT_STARTED";
export const DUPLICATE_ELEMENT_SUCCESS = "DUPLICATE_ELEMENT_SUCCESS";
export const DUPLICATE_ELEMENT_ERROR = "DUPLICATE_ELEMENT_ERROR";

export const POSITION_ELEMENT_STARTED = "POSITION_ELEMENT_STARTED";
export const POSITION_ELEMENT_SUCCESS = "POSITION_ELEMENT_SUCCESS";
export const POSITION_ELEMENT_ERROR = "POSITION_ELEMENT_ERROR";

type GetStructuresAction = ApiResultAction<
  | typeof GET_COURSE_STRUCTURE_STARTED
  | typeof GET_COURSE_STRUCTURE_SUCCESS
  | typeof GET_COURSE_STRUCTURE_ERROR
>;

type CreateElementAction = ApiResultAction<
  typeof CREATE_ELEMENT_STARTED | typeof CREATE_ELEMENT_SUCCESS | typeof CREATE_ELEMENT_ERROR
>;

type RenameElementAction = ApiResultAction<
  typeof RENAME_ELEMENT_STARTED | typeof RENAME_ELEMENT_SUCCESS | typeof RENAME_ELEMENT_ERROR
>;

type DeleteElementAction = ApiResultAction<
  typeof DELETE_ELEMENT_STARTED | typeof DELETE_ELEMENT_SUCCESS | typeof DELETE_ELEMENT_ERROR
>;

type DuplicateElementAction = ApiResultAction<
  | typeof DUPLICATE_ELEMENT_STARTED
  | typeof DUPLICATE_ELEMENT_SUCCESS
  | typeof DUPLICATE_ELEMENT_ERROR
>;

type UpdateConnectionAction = ApiResultAction<
  | typeof UPDATE_ELEMENT_CONNECTION_STARTED
  | typeof UPDATE_ELEMENT_CONNECTION_SUCCESS
  | typeof UPDATE_ELEMENT_CONNECTION_ERROR
>;

type UpdateAutoSummaryAction = ApiResultAction<
  | typeof UPDATE_ELEMENT_AUTO_SUMMARY_STARTED
  | typeof UPDATE_ELEMENT_AUTO_SUMMARY_SUCCESS
  | typeof UPDATE_ELEMENT_AUTO_SUMMARY_ERROR
>;

type UpdateSummaryAction = ApiResultAction<
  | typeof UPDATE_ELEMENT_SUMMARY_STARTED
  | typeof UPDATE_ELEMENT_SUMMARY_SUCCESS
  | typeof UPDATE_ELEMENT_SUMMARY_ERROR
>;

type PositionElementAction = ApiResultAction<
  typeof POSITION_ELEMENT_STARTED | typeof POSITION_ELEMENT_SUCCESS | typeof POSITION_ELEMENT_ERROR
>;

export type CourseStructureActions =
  | GetStructuresAction
  | CreateElementAction
  | RenameElementAction
  | DeleteElementAction
  | DuplicateElementAction
  | UpdateConnectionAction
  | UpdateAutoSummaryAction
  | UpdateSummaryAction
  | PositionElementAction;
