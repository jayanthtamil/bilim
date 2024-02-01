import { AnyAction, Middleware } from "redux";
import i18next from "i18next";

import { ElementType } from "editor-constants";
import { getEvaluationChildren, hasProperties, hasTemplates } from "utils";
import { hasEmptyTemplate } from "components/structures/panel/course-tree/utils";
import { AppThunkDispatch, AppThunkStore, RootState } from "redux/types";
import * as constants from "redux/constants";
import {
  closeElementPropertiesPanel,
  closeElementTemplatesPanel,
  closeStructurePanel,
  getCourseProperties,
  getCourseStructure,
  getCourseStyle,
  getElementTemplates,
  getLanguages,
  getThemes,
  openDialog,
  openElementPropertiesPanel,
  openElementTemplatesPanel,
  openStructurePanel,
  selectTreeItem,
  setElementPropertiesTabIndex,
  getElementProperties,
} from "redux/actions";
import { GlTemplateBuilderStore } from "template-builders";

export const editorMiddleware: Middleware<void, RootState, AppThunkDispatch> =
  (store) => (next) => (action: AnyAction) => {
    if (action) {
      const isValid = doBeforeAction(store, action);

      if (isValid) {
        const result = next(action);

        doAfterAction(store, action);

        return result;
      }
    }
  };

function doBeforeAction(store: AppThunkStore, action: AnyAction) {
  const { type, payload } = action;
  const { dispatch } = store;

  switch (type) {
    case constants.SELECT_TREE_ITEM:
      const { item } = payload as constants.SelectTreeItemAction["payload"];

      if (item?.type === ElementType.Question) {
        const { parent } = item;

        if (
          parent &&
          parent.type === ElementType.Chapter &&
          parent.isEvaluation &&
          parent.theme === null &&
          getEvaluationChildren(parent).length === 0
        ) {
          const onOk = () => {
            dispatch(openStructurePanel());
            dispatch(selectTreeItem(parent));
            dispatch(setElementPropertiesTabIndex(2));
          };

          dispatch(
            openDialog(
              i18next.t("alert.question_warning"),
              i18next.t("alert.question_info"),
              onOk,
              { className: "theme-warning-dialog" }
            )
          );

          return false;
        }
      }
      break;
  }

  return true;
}

function doAfterAction(store: AppThunkStore, action: AnyAction) {
  const { type, payload } = action;
  const { getState, dispatch } = store;
  const {
    editor: {
      core: { element, structurePanel },
    },
    course: {
      style: { style },
    },
  } = getState();

  switch (type) {
    case constants.INITIALIZE_COURSE_PROPERTIES:
      const { id } = payload as constants.InitCourseAction["payload"];

      dispatch(getCourseProperties(id));
      dispatch(getCourseStructure());
      dispatch(getCourseStyle(id));
      dispatch(getThemes(id));
      dispatch(getLanguages());
      break;
    case constants.SELECT_TREE_ITEM:
      const { item } = payload as constants.SelectTreeItemAction["payload"];

      if (item) {
        if (hasProperties(item)) {
          dispatch(openElementPropertiesPanel(item));
        } else if (hasTemplates(item)) {
          dispatch(openElementTemplatesPanel(item));
          dispatch(
            !structurePanel.isPinned || hasEmptyTemplate(item)
              ? closeStructurePanel()
              : openStructurePanel()
          );
        } else if (item.type === ElementType.PartPage && item.parent) {
          dispatch(openElementTemplatesPanel(item.parent, item));

          if (!structurePanel.isPinned) {
            dispatch(closeStructurePanel());
          }
        }
      } else {
        dispatch(closeElementPropertiesPanel());
        dispatch(closeElementTemplatesPanel());
      }
      break;
    case constants.GET_COURSE_STYLE_SUCCESS:
      if (style?.styles) {
        GlTemplateBuilderStore.setStyles(style?.styles);
      }
      break;
    case constants.DUPLICATE_ELEMENT_TEMPLATE_SUCCESS:
    case constants.DELETE_ELEMENT_TEMPLATE_SUCCESS:
    case constants.UPDATE_ELEMENT_TEMPLATES_SUCCESS:
    case constants.POSITION_ELEMENT_TEMPLATE_SUCCESS:
    case constants.UPDATE_ELEMENT_PROPERTIES_SUCCESS:
      if (element && hasTemplates(element)) {
        dispatch(getElementTemplates(element));
        getElementProperties(element);
      }
      dispatch(getCourseStructure());
      break;
    case constants.UPDATE_COURSE_PROPERTIES_SUCCESS:
    case constants.CREATE_ELEMENT_SUCCESS:
    case constants.RENAME_ELEMENT_SUCCESS:
    case constants.DELETE_ELEMENT_SUCCESS:
    case constants.DUPLICATE_ELEMENT_SUCCESS:
    case constants.UPDATE_ELEMENT_CONNECTION_SUCCESS:
    case constants.UPDATE_ELEMENT_AUTO_SUMMARY_SUCCESS:
    case constants.UPDATE_ELEMENT_SUMMARY_SUCCESS:
    case constants.RESET_ELEMENT_TEMPLATE_SUCCESS:
      dispatch(getCourseStructure());
      break;
    case constants.POSITION_ELEMENT_SUCCESS:
      if (element && hasTemplates(element)) {
        dispatch(getElementTemplates(element));
      }
      dispatch(getCourseStructure());
      break;
    case constants.GET_VIMEO_VIDEO_ERROR:
      break;
    default:
      if (action.error === true) {
        if (typeof payload.response === "object" && payload.response.error_no) {
          const { error_msg, redirect_url } = payload.response;
          const onOk = () => {
            if (redirect_url && redirect_url !== "") {
              window.location.href = redirect_url;
            }
          };

          dispatch(openDialog(i18next.t("alert.failed"), error_msg, onOk));
        } else if (payload.name === "ApiError") {
          dispatch(openDialog(i18next.t("alert.failed"), i18next.t("alert.api_failed")));
        } else {
          dispatch(openDialog(i18next.t("alert.failed"), i18next.t("alert.network_failed")));
        }
      }
      break;
  }
}
