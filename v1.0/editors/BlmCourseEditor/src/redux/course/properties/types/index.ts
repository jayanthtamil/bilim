import { CourseExternalFile, CourseProps } from "types";
import { CMSFolderTypes } from "editor-constants";
import { ApiResultAction } from "redux/types";

export interface CoursePropsState {
  id?: string;
  properties?: CourseProps;
}

export interface ContentFolderResponse {
  id: string;
  title: string;
  type: CMSFolderTypes;
  link: string;
  children: ContentFolderResponse[];
}

export interface CourseExternalFileResponse extends CourseExternalFile {}

export interface CoursePropsResponse {
  nid: string;
  parent: ContentFolderResponse;
  type: string;
  title: string;
  dispaly: string;
  desc: string;
  short_desc: string;
  keywords: string;
  original_course_name: string;
  objectives: string;
  language: string;
  duration: string;
  crs_version: string;
  nav_param: string | null;
  comp_param: string | null;
  eval_param: string | null;
  external_texts: string | null;
  external_files: CourseExternalFileResponse[] | null;
  isevaluation: string;
  hasfeedback: string;
  metadatas: string;
  no_of_words: string;
  taxonomy: string;
  thumbnail: string;
  url_edit: string;
  created: string;
  changed: string;
  created_by: string;
  modified_by: string;
}

export const INITIALIZE_COURSE_PROPERTIES = "INITIALIZE_COURSE_PROPERTIES";

export const GET_COURSE_PROPERTIES_STARTED = "GET_COURSE_PROPERTIES_STARTED";
export const GET_COURSE_PROPERTIES_SUCCESS = "GET_COURSE_PROPERTIES_SUCCESS";
export const GET_COURSE_PROPERTIES_ERROR = "GET_COURSE_PROPERTIES_ERROR";

export const UPDATE_COURSE_PROPERTIES_STARTED = "UPDATE_COURSE_PROPERTIES_STARTED";
export const UPDATE_COURSE_PROPERTIES_SUCCESS = "UPDATE_COURSE_PROPERTIES_SUCCESS";
export const UPDATE_COURSE_PROPERTIES_ERROR = "UPDATE_COURSE_PROPERTIES_ERROR";

export const REPLACE_COURSE_FILE_STARTED = "REPLACE_COURSE_FILE_STARTED";
export const REPLACE_COURSE_FILE_SUCCESS = "REPLACE_COURSE_FILE_SUCCESS";
export const REPLACE_COURSE_FILE_ERROR = "REPLACE_COURSE_FILE_ERROR";

export const GET_COURSE_PREVIEW_STARTED = "GET_COURSE_PREVIEW_STARTED";
export const GET_COURSE_PREVIEW_SUCCESS = "GET_COURSE_PREVIEW_SUCCESS";
export const GET_COURSE_PREVIEW_ERROR = "GET_COURSE_PREVIEW_ERROR";

export const GET_COURSE_EXPORTED_STARTED = "GET_COURSE_EXPORTED_STARTED";
export const GET_COURSE_EXPORTED_SUCCESS = "GET_COURSE_EXPORTED_SUCCESS";
export const GET_COURSE_EXPORTED_ERROR = "GET_COURSE_EXPORTED_ERROR";

export type InitCourseAction = {
  type: typeof INITIALIZE_COURSE_PROPERTIES;
  payload: {
    id: string;
  };
};

type GetCoursePropsAction = ApiResultAction<
  | typeof GET_COURSE_PROPERTIES_STARTED
  | typeof GET_COURSE_PROPERTIES_SUCCESS
  | typeof GET_COURSE_PROPERTIES_ERROR
>;

type UpdateCoursePropsAction = ApiResultAction<
  | typeof UPDATE_COURSE_PROPERTIES_STARTED
  | typeof UPDATE_COURSE_PROPERTIES_SUCCESS
  | typeof UPDATE_COURSE_PROPERTIES_ERROR
>;

type ReplaceCourseFileAction = ApiResultAction<
  | typeof REPLACE_COURSE_FILE_STARTED
  | typeof REPLACE_COURSE_FILE_SUCCESS
  | typeof REPLACE_COURSE_FILE_ERROR
>;

type GetCoursePreviewAction = ApiResultAction<
  | typeof GET_COURSE_PREVIEW_STARTED
  | typeof GET_COURSE_PREVIEW_SUCCESS
  | typeof GET_COURSE_PREVIEW_ERROR
>;

type GetCourseExportAction = ApiResultAction<
  | typeof GET_COURSE_EXPORTED_STARTED
  | typeof GET_COURSE_EXPORTED_SUCCESS
  | typeof GET_COURSE_EXPORTED_ERROR
>;

export type CourseActions =
  | InitCourseAction
  | GetCoursePropsAction
  | UpdateCoursePropsAction
  | ReplaceCourseFileAction
  | GetCoursePreviewAction
  | GetCourseExportAction;
