import { CourseProps, CourseExport, CourseExternalFile } from "types";
import { fetchAPI } from "redux/api";
import * as actions from "../types";
import { createExportAPI, createPropertiesAPI } from "../utils";

export const initializeCourseProperties = (id: string): actions.InitCourseAction => {
  return {
    type: actions.INITIALIZE_COURSE_PROPERTIES,
    payload: {
      id: id,
    },
  };
};

export const getCourseProperties = (id: string) => {
  return fetchAPI({
    url: "api/course_document_module/" + id,
    method: "GET",
    authenticated: true,
    types: [
      actions.GET_COURSE_PROPERTIES_STARTED,
      actions.GET_COURSE_PROPERTIES_SUCCESS,
      actions.GET_COURSE_PROPERTIES_ERROR,
    ],
  });
};

export const updateCourseProperties = (properties: CourseProps) => {
  const body = createPropertiesAPI(properties);

  return fetchAPI({
    url: "api/course_document_module/" + properties.id,
    method: "PATCH",
    authenticated: true,
    meta: properties,
    body: JSON.stringify(body),
    types: [
      actions.UPDATE_COURSE_PROPERTIES_STARTED,
      actions.UPDATE_COURSE_PROPERTIES_SUCCESS,
      actions.UPDATE_COURSE_PROPERTIES_ERROR,
    ],
  });
};

export const replaceCourseFile = (external: CourseExternalFile, file: File) => {
  const headers = { "Content-Disposition": 'file; filename="' + file.name + '"' };
  const { id, path } = external;

  const formData = new FormData();
  formData.append("id", id);
  formData.append("path", path);
  formData.append("file", file, file.name);

  return fetchAPI({
    url: "service/replace-external-file",
    method: "POST",
    authenticated: false,
    headers,
    body: formData,
    meta: { id, external },
    types: [
      actions.REPLACE_COURSE_FILE_STARTED,
      actions.REPLACE_COURSE_FILE_SUCCESS,
      actions.REPLACE_COURSE_FILE_ERROR,
    ],
  });
};

export const getCoursePreview = (
  courseId: string | number,
  elementId?: string | undefined,
  eventCLick?: boolean
) => {
  const body = { crs_id: courseId, element_id: elementId || "", ctrl_click: eventCLick };

  return fetchAPI({
    url: "preview-course",
    method: "POST",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.GET_COURSE_EXPORTED_STARTED,
      actions.GET_COURSE_EXPORTED_SUCCESS,
      actions.GET_COURSE_EXPORTED_ERROR,
    ],
  });
};

export const getCourseExport = (id: string, exports: CourseExport) => {
  const body = createExportAPI(id, exports);

  return fetchAPI({
    url: "export-course",
    method: "POST",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.GET_COURSE_EXPORTED_STARTED,
      actions.GET_COURSE_EXPORTED_SUCCESS,
      actions.GET_COURSE_EXPORTED_ERROR,
    ],
  });
};
