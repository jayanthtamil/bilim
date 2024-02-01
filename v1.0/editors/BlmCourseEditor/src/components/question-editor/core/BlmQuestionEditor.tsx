import React, { forwardRef, MouseEvent, useEffect, useImperativeHandle, useReducer } from "react";
import { useTranslation } from "react-i18next";

import {
  CourseElement,
  CourseElementTemplate,
  QuestionTemplate,
  TemplateEditorComponent,
} from "types";
import { differenceOfObjects } from "utils";
import { VerticalTabs } from "shared/material-ui";
import {
  getQuestionHTMLJSON,
  getQuestionMedias,
  getQuestionTemplateModel,
  setQuestionTemplateHTML,
} from "template-builders";
import {
  BlmQuestionDashboard,
  BlmQuestionIntroduction,
  BlmQuestionMain,
  BlmQuestionFeedback,
  BlmQuestionParameters,
} from "../panels";
import { initQuestionEditor, QuestionEditorState, questionReducer } from "../reducers";
import QuestionEditorContext from "./QuestionEditorContext";
import { ContainerProps } from "./container";
import "./question-editor.scss";

interface CompProps extends ContainerProps {
  element: CourseElement;
  template: CourseElementTemplate;
  onSave: (template: CourseElementTemplate) => void;
  onClose: (event: MouseEvent) => void;
}

const initState: QuestionEditorState = {
  data: null,
  oldMedias: [],
  isEdited: false,
};

const createTemplate = (template: CourseElementTemplate, question: QuestionTemplate) => {
  const newTemplate: CourseElementTemplate = {
    ...template,
  };

  newTemplate.html = setQuestionTemplateHTML(newTemplate, question);
  newTemplate.htmlJSON = getQuestionHTMLJSON(newTemplate, question);

  return newTemplate;
};

const BlmQuestionTemplate = forwardRef<TemplateEditorComponent, CompProps>((props, ref) => {
  const { element, template, onSave, onClose, removeFiles, clearFiles } = props;
  const [state, dispatch] = useReducer(questionReducer, initState);
  const { data, oldMedias, isEdited } = state;
  const { t } = useTranslation("question-editor");

  useImperativeHandle(ref, () => ({
    isEdited,
    saveOnClose: handleSaveOnClose,
    revert: revertChanges,
  }));

  useEffect(() => {
    if (template) {
      const editor = getQuestionTemplateModel(template);

      dispatch(initQuestionEditor(editor));
    }
  }, [template, dispatch]);

  const saveChanges = () => {
    if (data && isEdited) {
      const newTemplate = createTemplate(template, data);
      const newMedias = getQuestionMedias(data);
      const deleteMedias = differenceOfObjects(oldMedias, newMedias, "id");

      if (onSave) {
        onSave(newTemplate);
      }

      removeFiles(deleteMedias);
    }
  };

  const revertChanges = () => {
    clearFiles(element.id, false);
  };

  const handleSaveOnClose = (event: MouseEvent) => {
    saveChanges();
    clearFiles(element.id, true);

    if (onClose) {
      onClose(event);
    }
  };

  const renderThumbnail = () => {
    return (
      <div className="template-thumbnail-box">
        {template.thumbnail && <img src={template.thumbnail} alt="" />}
      </div>
    );
  };

  if (!data) {
    return null;
  } else {
    const { type, introduction, main, feedback, parameters } = data;

    return (
      <QuestionEditorContext.Provider value={{ element }}>
        <div className="question-editor-wrapper">
          <VerticalTabs
            selectedIndex={1}
            otherChildren={renderThumbnail()}
            className="question-editor-tabs"
          >
            <BlmQuestionDashboard label={t("tabs.introduction")} template={template}>
              <BlmQuestionIntroduction data={introduction} dispatch={dispatch} />
            </BlmQuestionDashboard>
            <BlmQuestionDashboard label={t("tabs.main")} template={template}>
              <BlmQuestionMain
                type={type}
                introduction={introduction}
                data={main}
                feedback={feedback}
                dispatch={dispatch}
              />
            </BlmQuestionDashboard>
            <BlmQuestionDashboard label={t("tabs.feedback")} template={template}>
              <BlmQuestionFeedback main={main} data={feedback} dispatch={dispatch} />
            </BlmQuestionDashboard>
            <BlmQuestionDashboard label={t("tabs.parameters")} template={template}>
              <BlmQuestionParameters data={parameters} dispatch={dispatch} />
            </BlmQuestionDashboard>
          </VerticalTabs>
          <div className="question-editor-close-btn" onClick={handleSaveOnClose} />
        </div>
      </QuestionEditorContext.Provider>
    );
  }
});

export default BlmQuestionTemplate;
