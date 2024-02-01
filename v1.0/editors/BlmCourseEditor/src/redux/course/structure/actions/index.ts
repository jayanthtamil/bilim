import {
  ChapterEvaluationProps,
  CourseElement,
  CourseElementTemplate,
  UpdateElementConnectionPost,
} from "types";
import { ElementType, EvaluationType } from "editor-constants";
import { toDeepJSONString } from "utils";
import { fetchAPI } from "redux/api";
import { ApiThunkAction } from "redux/types";
import * as actions from "../types";

export const getCourseStructure = (): ApiThunkAction => (dispatch, getState) => {
  const {
    course: { properties },
  } = getState();

  if (!properties.id || properties.id === "") {
    return;
  }

  return dispatch(
    fetchAPI({
      url: "api/course_tree/" + properties.id,
      method: "GET",
      authenticated: true,
      types: [
        actions.GET_COURSE_STRUCTURE_STARTED,
        actions.GET_COURSE_STRUCTURE_SUCCESS,
        actions.GET_COURSE_STRUCTURE_ERROR,
      ],
    })
  );
};

export const createElement = (
  parent: CourseElement,
  element: Pick<CourseElement, "name" | "type" | "isSummary">,
  position?: number
) => {
  const body: any = {
    parent: parent.id,
    title: element.name,
    type: element.type,
    summary: element.isSummary ? "true" : undefined,
    position, //Now first and last only working, not working at other position.
  };

  if (element.type === ElementType.Evaluation) {
    const evaluation = new ChapterEvaluationProps();
    evaluation.evaluation = EvaluationType.Evaluation;
    evaluation.feedback.checked = true;

    body.type = ElementType.Chapter;
    body.direct_evaluation = "true";
    body.isevaluation = "true";
    body.hasfeedback = "true";
    body.eval_param = evaluation;
  }

  return fetchAPI({
    url: "api/create/elem",
    method: "POST",
    authenticated: true,
    body: toDeepJSONString(body),
    types: [
      actions.CREATE_ELEMENT_STARTED,
      actions.CREATE_ELEMENT_SUCCESS,
      actions.CREATE_ELEMENT_ERROR,
    ],
  });
};

export const renameElement = (
  element: Pick<CourseElement, "id">,
  title: string,
  template?: CourseElementTemplate
) => {
  const body = { title };

  return fetchAPI({
    url: "api/elem/rename/" + element.id,
    method: "PATCH",
    meta: template,
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.RENAME_ELEMENT_STARTED,
      actions.RENAME_ELEMENT_SUCCESS,
      actions.RENAME_ELEMENT_ERROR,
    ],
  });
};

export const updateElementConnection = (
  element: CourseElement,
  posts: UpdateElementConnectionPost[]
) => {
  const body = {
    elements: posts,
  };

  return fetchAPI({
    url: "api/elem/" + element.id,
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.UPDATE_ELEMENT_CONNECTION_STARTED,
      actions.UPDATE_ELEMENT_CONNECTION_SUCCESS,
      actions.UPDATE_ELEMENT_CONNECTION_ERROR,
    ],
  });
};

export const updateAutoSummary = (element: CourseElement, autoSummary: boolean) => {
  const body = {
    styleSummary: autoSummary ? "true" : "false",
  };

  return fetchAPI({
    url: "api/autosummary/" + element.id,
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.UPDATE_ELEMENT_AUTO_SUMMARY_STARTED,
      actions.UPDATE_ELEMENT_AUTO_SUMMARY_SUCCESS,
      actions.UPDATE_ELEMENT_AUTO_SUMMARY_ERROR,
    ],
  });
};

export const updateElementSummary = (element: CourseElement, summary: boolean) => {
  const body = {
    summary: summary ? "true" : "false",
  };

  return fetchAPI({
    url: "api/summary/" + element.id,
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.UPDATE_ELEMENT_SUMMARY_STARTED,
      actions.UPDATE_ELEMENT_SUMMARY_SUCCESS,
      actions.UPDATE_ELEMENT_SUMMARY_ERROR,
    ],
  });
};

export const deleteElement = (element: CourseElement) => {
  const body = { parent: element.parent?.id };

  return fetchAPI({
    url: "api/course_tree/" + element.id,
    method: "DELETE",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.DELETE_ELEMENT_STARTED,
      actions.DELETE_ELEMENT_SUCCESS,
      actions.DELETE_ELEMENT_ERROR,
    ],
  });
};

export const duplicateElement = (
  element: CourseElement,
  type?: string,
  newParent?: string | undefined,
  courseId?: string | null
) => {
  var body = {};
  if (type && newParent) {
    body = {
      parent: element.parent?.id,
      nparent: newParent,
      actiontype: type,
      ncourseId: courseId,
    };
  } else {
    body = { parent: element.parent?.id };
  }

  return fetchAPI({
    url: "api/course_tree/duplicate/" + element.id,
    method: "POST",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.DUPLICATE_ELEMENT_STARTED,
      actions.DUPLICATE_ELEMENT_SUCCESS,
      actions.DUPLICATE_ELEMENT_ERROR,
    ],
  });
};

export const positionElement = (
  element: CourseElement,
  oldParent: CourseElement,
  newParent: CourseElement,
  newPosition: number
) => {
  const body = { cid: element.id, cparent: oldParent.id, nparent: newParent.id, npos: newPosition };

  return fetchAPI({
    url: "api/change/elem/" + element.id,
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.POSITION_ELEMENT_STARTED,
      actions.POSITION_ELEMENT_SUCCESS,
      actions.POSITION_ELEMENT_ERROR,
    ],
  });
};

export const subMenuPositionElement = (
  elementId: string | undefined,
  oldParent: string | undefined,
  newParent: string | undefined,
  newPosition: number,
  copyFrom?: string
) => {
  var body = {};
  if (copyFrom) {
    body = {
      cid: elementId,
      cparent: oldParent,
      nparent: newParent,
      npos: newPosition,
      actiontype: copyFrom,
    };
  } else {
    body = { cid: elementId, cparent: oldParent, nparent: newParent, npos: newPosition };
  }
  return fetchAPI({
    url: "api/change/elem/" + elementId,
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(body),
    types: [
      actions.POSITION_ELEMENT_STARTED,
      actions.POSITION_ELEMENT_SUCCESS,
      actions.POSITION_ELEMENT_ERROR,
    ],
  });
};
