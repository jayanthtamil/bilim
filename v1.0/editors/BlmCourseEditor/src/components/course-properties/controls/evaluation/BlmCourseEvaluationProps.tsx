import React, { ChangeEvent, Fragment } from "react";
import { Checkbox, FormControlLabel, MenuItem, Select, Switch } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, CoursePropsComponent, CourseEvaluationProps } from "types";
import { EvaluationType } from "editor-constants";
import { getEvaluationPropsJSON } from "utils";
import { BlmEvaluationFeedback, EvaluationFeedbackChangeEvent } from "components/shared";
import { changeKeyMap } from "./types";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends CoursePropsComponent, ContainerProps {}

function BlmCourseEvaluationProps(props: CompProps) {
  const { structure, data, onChange } = props;
  const { evaluation } = data;
  const { t } = useTranslation("course-props");

  const updateChange = (newEvaluation: CourseEvaluationProps) => {
    const newData = {
      ...data,
      isEvaluation: newEvaluation.evaluation !== EvaluationType.None,
      hasFeedback: newEvaluation.feedback.checked,
      evaluation: newEvaluation,
      propsJSON: getEvaluationPropsJSON(newEvaluation, data.propsJSON),
    };

    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (
    event: ChangeEvent<any> | EvaluationFeedbackChangeEvent | CustomChangeEvent<number | string>
  ) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    let newEvaluation: CourseEvaluationProps | undefined;

    if (changeKeyMap.hasOwnProperty(name)) {
      const map = changeKeyMap[name];
      const { obj, key } = map;

      newEvaluation = {
        ...evaluation,
        [obj]: {
          ...evaluation[obj],
          [key]: value,
        },
      };
    } else if (name === "feedback") {
      const { score, feedback } = value;

      newEvaluation = {
        ...evaluation,
        success_score: score,
        feedback,
      };
    } else {
      newEvaluation = {
        ...evaluation,
        [name]: value,
      };
    }

    if (newEvaluation) {
      updateChange(newEvaluation);
    }
  };

  if (structure) {
    return (
      <div className="course-evaluation-props-container">
        <div className="crs-evaluation-top-container">
          <Select
            name="evaluation"
            value={evaluation.evaluation}
            className="crs-evaluation-dropdown"
            onChange={handleChange}
          >
            <MenuItem value={EvaluationType.None}>{t("evaluation.list.none")}</MenuItem>
            <MenuItem value={EvaluationType.Evaluation}>{t("evaluation.list.evaluation")}</MenuItem>
          </Select>
        </div>
        {evaluation.evaluation !== EvaluationType.None && (
          <Fragment>
            <FormControlLabel
              name="save_in_lms"
              label={t("evaluation.save_lms")}
              control={<Switch />}
              checked={evaluation.save_in_lms}
              disabled={evaluation.evaluation !== EvaluationType.Evaluation}
              className="crs-evalutaion-switch-frm-lbl"
              onChange={handleChange}
            />
            <BlmEvaluationFeedback
              element={structure}
              score={evaluation.success_score}
              feedback={evaluation.feedback}
              onChange={handleChange}
            />
            <div className="crs-evaluation-question-container">
              <span className="crs-evaluation-proposition-feedback-title">
                {t("evaluation.proposition_fb")}
              </span>
              <div className="crs-evaluation-proposition-feedback-group">
                <FormControlLabel
                  name="proposition_feedback_opt1"
                  label={t("evaluation.by_question")}
                  control={<Checkbox />}
                  checked={evaluation.proposition_feedback.by_question}
                  className="crs-evaluation-proposition-feedback-option mui-radio-form-ctrl-lbl-1"
                  onChange={handleChange}
                />
                <FormControlLabel
                  name="proposition_feedback_opt2"
                  label={t("evaluation.in_evaluation_fb")}
                  control={<Checkbox />}
                  checked={evaluation.proposition_feedback.global}
                  className="crs-evaluation-proposition-feedback-option mui-radio-form-ctrl-lbl-1"
                  onChange={handleChange}
                />
              </div>
              <span className="crs-evaluation-question-feedback-title">
                {t("evaluation.question_fb")}
              </span>
              <div className="crs-evaluation-question-feedback-group">
                <FormControlLabel
                  name="question_feedback_opt1"
                  label={t("evaluation.by_question")}
                  control={<Checkbox />}
                  checked={evaluation.question_feedback.by_question}
                  className="crs-evaluation-question-feedback-option mui-radio-form-ctrl-lbl-1"
                  onChange={handleChange}
                />
                <FormControlLabel
                  name="question_feedback_opt2"
                  label={t("evaluation.in_evaluation_fb")}
                  control={<Checkbox />}
                  checked={evaluation.question_feedback.global}
                  className="crs-evaluation-question-feedback-option mui-radio-form-ctrl-lbl-1"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="crs-evaluation-advanced-container">
              <div className="crs-evaluation-advanced-title">{t("evaluation.advanced")}</div>
              <FormControlLabel
                name="advanced_opt1"
                label={t("evaluation.show_complete")}
                control={<Checkbox />}
                checked={evaluation.advanced.show_as_complete_even_if_no_succeed}
                className="mui-radio-form-ctrl-lbl-1"
                onChange={handleChange}
              />
              <FormControlLabel
                name="advanced_opt2"
                label={t("evaluation.all_sub_eval")}
                control={<Checkbox />}
                checked={evaluation.advanced.all_sub_eval_succeed_for_validate}
                className="mui-radio-form-ctrl-lbl-1"
                onChange={handleChange}
              />
            </div>
          </Fragment>
        )}
      </div>
    );
  } else {
    return null;
  }
}

export default BlmCourseEvaluationProps;
