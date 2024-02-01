import { CourseStyle, CMSFile } from "types";
import { ApiResultAction } from "redux/types";

export interface CourseStyleState {
  style?: CourseStyle;
}

export interface StyleFileResponse extends CMSFile {
  children: StyleFileResponse[] | null;
}

export interface CourseStyleResponse {
  id: string;
  name: string;
  styles: StyleFileResponse[];
}

export const GET_COURSE_STYLE_STARTED = "GET_COURSE_STYLE_STARTED";
export const GET_COURSE_STYLE_SUCCESS = "GET_COURSE_STYLE_SUCCESS";
export const GET_COURSE_STYLE_ERROR = "GET_COURSE_STYLE_ERROR";

type GetCourseStyleAction = ApiResultAction<
  typeof GET_COURSE_STYLE_STARTED | typeof GET_COURSE_STYLE_SUCCESS | typeof GET_COURSE_STYLE_ERROR
>;

export type StyleActions = GetCourseStyleAction;
