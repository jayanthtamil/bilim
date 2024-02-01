import React, { ChangeEvent, Fragment } from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  Switch,
  Checkbox,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  CourseElement,
  CourseElementProps,
  ElementPropsComponent,
  PageEvaluationProps,
} from "types";
import { EvaluationType, EvaluationQuestionValidate } from "editor-constants";
import { getEvaluationPropsJSON } from "utils";
import BlmStructureSelect, { StructureSelectChangeEvent } from "components/structures/select";
import { BlmEvaluationFeedback, EvaluationFeedbackChangeEvent } from "components/shared";
import { changeKeyMap } from "./utils";
import "./page-evaluation.scss";

interface CompProps extends ElementPropsComponent<PageEvaluationProps> {
  element: CourseElement;
}

function BlmPageEvaluationProps(props: CompProps) {
  const { element, data, onChange } = props;
  const state = data.evalutionJSON!;
  const { t } = useTranslation("properties");

  const updateChange = (newData: CourseElementProps<PageEvaluationProps>) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const updateState = (newState: PageEvaluationProps) => {
    if (newState.question_validate === EvaluationQuestionValidate.OneButtonOfTheEnd) {
      newState.question_feedback.by_question = false;
    }

    const newData: CourseElementProps<PageEvaluationProps> = {
      ...data,
      isEvaluation: newState.evaluation !== EvaluationType.None,
      hasFeedback: newState.feedback.checked,
      evalutionJSON: newState,
      propsJSON: getEvaluationPropsJSON(newState, data.propsJSON),
    };

    updateChange(newData);
  };

  const handleChange = (
    event: ChangeEvent<any> | EvaluationFeedbackChangeEvent | StructureSelectChangeEvent
  ) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    let newState: PageEvaluationProps | undefined;

    if (changeKeyMap.hasOwnProperty(name)) {
      const map = changeKeyMap[name];
      const { obj, key } = map;

      newState = {
        ...state,
        [obj]: {
          ...state[obj],
          [key]: value,
        },
      };
    } else if (name === "feedback") {
      const { score, feedback } = value;

      newState = {
        ...state,
        success_score: score,
        feedback,
      };
    } else {
      newState = {
        ...state,
        [name]: value,
      };
    }

    if (newState) {
      updateState(newState);
    }
  };

  return (
    <div className="page-evaluation-props-container">
      <div className="evaluation-top-container">
        <Select
          name="evaluation"
          value={state.evaluation}
          className="evaluation-dropdown"
          onChange={handleChange}
        >
          <MenuItem value={EvaluationType.None}>{t("evaluation.list.none")}</MenuItem>
          <MenuItem value={EvaluationType.Evaluation}>{t("tabs.evaluation")}</MenuItem>
        </Select>
        {state.evaluation === EvaluationType.Evaluation && (
          <Fragment>
            <FormControlLabel
              name="related_to"
              label={t("evaluation.related_to")}
              control={<Checkbox />}
              checked={state.related_to.checked}
              className="related-to-lbl"
              onChange={handleChange}
            />
            {state.related_to.checked && (
              <BlmStructureSelect
                name="related_to_value"
                value={state.related_to.value}
                className="related-to-select"
                onChange={handleChange}
              />
            )}
          </Fragment>
        )}
      </div>
      {state.evaluation !== EvaluationType.None && (
        <Fragment>
          <FormControlLabel
            name="save_in_lms"
            label={t("evaluation.save_lms")}
            control={<Switch />}
            checked={state.save_in_lms}
            disabled={state.evaluation !== EvaluationType.Evaluation}
            className="evalutaion-switch-frm-lbl"
            onChange={handleChange}
          />
          <div className="evaluation-fb-quiz-container">
            <BlmEvaluationFeedback
              element={element}
              score={state.success_score}
              feedback={state.feedback}
              display={state.feedback.display}
              onChange={handleChange}
            />
            {state.evaluation === EvaluationType.Evaluation && (
              <div className="retry-quiz-container">
                <FormControlLabel
                  name="retry_quiz"
                  label={t("evaluation.retry_quiz")}
                  control={<Checkbox />}
                  checked={state.retry_quiz.checked}
                  className="evaluation-retry-quiz-frm-lbl"
                  onChange={handleChange}
                />
                {state.retry_quiz.checked && (
                  <Fragment>
                    <Select
                      name="retry_quiz_attempts"
                      value={state.retry_quiz.attempts}
                      className="evaluation-retry-quiz-dropdown"
                      onChange={handleChange}
                    >
                      <MenuItem value="2">{t("evaluation.list.attempt2")}</MenuItem>
                      <MenuItem value="3">{t("evaluation.list.attempt3")}</MenuItem>
                      <MenuItem value="unlimited">{t("evaluation.list.unlimited")}</MenuItem>
                    </Select>
                    <FormControlLabel
                      name="retry_quiz_lock"
                      label={t("evaluation.lock")}
                      control={<Checkbox />}
                      checked={state.retry_quiz.lock_when_success}
                      className="evaluation-retry-quiz-lock-frm-lbl"
                      onChange={handleChange}
                    />
                  </Fragment>
                )}
              </div>
            )}
          </div>
          <div className="evaluation-question-container">
            <span className="evaluation-proposition-feedback-title">
              {t("evaluation.proposition_fb")}
            </span>
            <div className="evaluation-proposition-feedback-group">
              <FormControlLabel
                name="proposition_feedback_opt1"
                label={t("evaluation.by_question")}
                control={<Checkbox />}
                checked={state.proposition_feedback.by_question}
                className="evaluation-proposition-feedback-option mui-radio-form-ctrl-lbl-1"
                onChange={handleChange}
              />
              <FormControlLabel
                name="proposition_feedback_opt2"
                label={t("evaluation.in_evaluation_fb")}
                control={<Checkbox />}
                checked={state.proposition_feedback.global}
                className="evaluation-proposition-feedback-option mui-radio-form-ctrl-lbl-1"
                onChange={handleChange}
              />
            </div>
            <span className="evaluation-question-feedback-title">
              {t("evaluation.question_fb")}
            </span>
            <div className="evaluation-question-feedback-group">
              <FormControlLabel
                name="question_feedback_opt1"
                label={t("evaluation.by_question")}
                control={<Checkbox />}
                checked={state.question_feedback.by_question}
                disabled={state.question_validate === EvaluationQuestionValidate.OneButtonOfTheEnd}
                className="evaluation-question-feedback-option mui-radio-form-ctrl-lbl-1"
                onChange={handleChange}
              />
              <FormControlLabel
                name="question_feedback_opt2"
                label={t("evaluation.in_evaluation_fb")}
                control={<Checkbox />}
                checked={state.question_feedback.global}
                className="evaluation-question-feedback-option mui-radio-form-ctrl-lbl-1"
                onChange={handleChange}
              />
            </div>
            <span className="evaluation-question-validate-title">
              {t("page_evaluation.validate_button")}
            </span>
            <RadioGroup
              name="question_validate"
              value={state.question_validate}
              className="evaluation-question-validate-group"
              onChange={handleChange}
            >
              <FormControlLabel
                label={t("page_evaluation.one_per_ques")}
                control={<Radio />}
                value={EvaluationQuestionValidate.OnePerQuestion}
                className="evaluation-question-validate-option mui-radio-form-ctrl-lbl-1"
              />
              <FormControlLabel
                label={t("page_evaluation.button_end")}
                control={<Radio />}
                value={EvaluationQuestionValidate.OneButtonOfTheEnd}
                className="evaluation-question-validate-option mui-radio-form-ctrl-lbl-1"
              />
            </RadioGroup>
          </div>
          <div className="evaluation-advanced-container">
            <div className="evaluation-advanced-title">{t("evaluation.advanced")}</div>
            <FormControlLabel
              name="advanced_opt1"
              label={t("evaluation.show_complete")}
              control={<Checkbox />}
              checked={state.advanced.show_as_complete_even_if_no_succeed}
              className="mui-radio-form-ctrl-lbl-1"
              onChange={handleChange}
            />
          </div>
        </Fragment>
      )}
    </div>
  );
}

export default BlmPageEvaluationProps;
