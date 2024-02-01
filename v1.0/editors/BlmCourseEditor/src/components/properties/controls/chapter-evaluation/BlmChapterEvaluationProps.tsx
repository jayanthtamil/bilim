import React, { ChangeEvent, Fragment, useCallback, useEffect } from "react";
import {
  RadioGroup,
  Radio,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Switch,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  CourseElementProps,
  ElementPropsComponent,
  ChapterEvaluationProps,
  CourseElement,
  CustomChangeEvent,
} from "types";
import { ElementType, EvaluationType } from "editor-constants";
import { filterElements, getEvaluationPropsJSON } from "utils";
import { BlmSubscriptInput } from "shared";
import BlmStructureSelect from "components/structures/select";
import { BlmEvaluationFeedback, EvaluationFeedbackChangeEvent } from "components/shared";
import { BlmThemes } from "components/domain";
import { changeKeyMap } from "./utils";
import "./chapter-evaluation.scss";

interface CompProps extends ElementPropsComponent<ChapterEvaluationProps> {
  element: CourseElement;
}

function BlmChapterEvaluationProps(props: CompProps) {
  const { element, data, onChange } = props;
  const state = data.evalutionJSON!;
  const totalQuestions = filterElements(element.children, [ElementType.Question]).length;
  const { t } = useTranslation("properties");

  const updateChange = useCallback(
    (newData: CourseElementProps<ChapterEvaluationProps>, forceSave = false) => {
      if (onChange) {
        onChange(newData, forceSave);
      }
    },
    [onChange]
  );

  const updateState = useCallback(
    (newState: ChapterEvaluationProps, forceSave = false) => {
      const newData: CourseElementProps<ChapterEvaluationProps> = {
        ...data,
        isEvaluation: newState.evaluation !== EvaluationType.None,
        hasFeedback: newState.feedback.checked,
        theme: newState.theme,
        evalutionJSON: newState,
        propsJSON: getEvaluationPropsJSON(newState, data.propsJSON),
      };

      updateChange(newData, forceSave);
    },
    [data, updateChange]
  );

  useEffect(() => {
    if (state.randomize_questions.value > totalQuestions) {
      let newState: ChapterEvaluationProps | undefined;
      var newRandomizeQues =
        state.randomize_questions.value > totalQuestions
          ? totalQuestions
          : state.randomize_questions.value;

      const map = changeKeyMap["randomize_questions_value"];
      const { obj, key } = map;
      newState = {
        ...state,
        [obj]: {
          ...state[obj],
          [key]: newRandomizeQues,
        },
      };

      if (newState) {
        updateState(newState, false);
      }
    }
  }, [state, totalQuestions, updateState]);

  const handleChange = (
    event: ChangeEvent<any> | EvaluationFeedbackChangeEvent | CustomChangeEvent<number | string>
  ) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    let newState: ChapterEvaluationProps | undefined;

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
    } else if (name === "randomize_questions_opt") {
      newState = {
        ...state,
        randomize_questions: { ...state.randomize_questions, value: value === "all" ? 0 : 1 },
      };
    } else {
      newState = {
        ...state,
        [name]: value,
      };
    }

    if (newState) {
      updateState(newState, name === "theme");
    }
  };

  return (
    <div className="chapter-evaluation-props-container">
      <div className="evaluation-top-container">
        <Select
          name="evaluation"
          value={state.evaluation}
          className="evaluation-dropdown"
          onChange={handleChange}
        >
          <MenuItem value={EvaluationType.None}>{t("evaluation.list.none")}</MenuItem>
          <MenuItem value={EvaluationType.Evaluation}>{t("tabs.evaluation")}</MenuItem>
          {data.type !== ElementType.Page && (
            <MenuItem value={EvaluationType.Placement}>{t("evaluation.list.placement")}</MenuItem>
          )}
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
          {(state.evaluation === EvaluationType.Evaluation ||
            state.evaluation === EvaluationType.Placement) && (
            <BlmThemes element={element} theme={state.theme} onChange={handleChange} />
          )}
          {(state.evaluation === EvaluationType.Evaluation ||
            state.evaluation === EvaluationType.Placement) &&
            state.theme && (
              <Fragment>
                <div className="evaluation-fb-quiz-container">
                  <BlmEvaluationFeedback
                    element={element}
                    score={state.success_score}
                    feedback={state.feedback}
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
                <div className="evaluation-timer-container">
                  <FormControlLabel
                    name="timer"
                    label={t("evaluation.timer")}
                    control={<Checkbox />}
                    checked={state.timer.checked}
                    className="evaluation-timer-frm-lbl"
                    onChange={handleChange}
                  />
                  <BlmSubscriptInput
                    label={t("evaluation.sec")}
                    name="timer_value"
                    value={state.timer.value}
                    style={{
                      visibility: state.timer.checked ? "visible" : "hidden",
                    }}
                    className="evaluation-timer-txt"
                    onChange={handleChange}
                  />
                  <FormControlLabel
                    name="randomize_questions"
                    label={t("evaluation.randomize_question")}
                    control={<Checkbox />}
                    checked={state.randomize_questions.checked}
                    className="evaluation-random-quiz-frm-lbl"
                    onChange={handleChange}
                  />
                  <RadioGroup
                    name="randomize_questions_opt"
                    value={state.randomize_questions.value === 0 ? "all" : "other"}
                    style={{
                      visibility: state.randomize_questions.checked ? "visible" : "hidden",
                    }}
                    className="randomize-radio-group"
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      label={t("label.all")}
                      control={<Radio />}
                      value="all"
                      className="evaluation-question-validate-option mui-radio-form-ctrl-lbl-1"
                    />
                    <FormControlLabel
                      label={
                        <BlmSubscriptInput
                          name="randomize_questions_value"
                          label={`/${totalQuestions}  ${t("evaluation.question")}`}
                          min={1}
                          max={totalQuestions}
                          value={state.randomize_questions.value || undefined}
                          disabled={totalQuestions === 0}
                          className="evaluation-random-quiz-txt"
                          onChange={handleChange}
                        />
                      }
                      control={<Radio />}
                      value="other"
                      disabled={totalQuestions === 0}
                      className="evaluation-question-validate-option mui-radio-form-ctrl-lbl-1"
                    />
                  </RadioGroup>
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
                </div>
                <div className="evaluation-advanced-container">
                  <div className="evaluation-advanced-title">{t("evaluation.advanced")}</div>
                  {state.evaluation !== EvaluationType.Placement && (
                    <FormControlLabel
                      name="advanced_opt1"
                      label={t("evaluation.show_complete")}
                      control={<Checkbox />}
                      checked={state.advanced.show_as_complete_even_if_no_succeed}
                      className="mui-radio-form-ctrl-lbl-1"
                      onChange={handleChange}
                    />
                  )}
                  <FormControlLabel
                    name="advanced_opt2"
                    label={t("evaluation.all_sub_eval")}
                    control={<Checkbox />}
                    checked={state.advanced.all_sub_eval_succeed_for_validate}
                    className="mui-radio-form-ctrl-lbl-1"
                    onChange={handleChange}
                  />
                </div>
              </Fragment>
            )}
        </Fragment>
      )}
    </div>
  );
}
export default BlmChapterEvaluationProps;
