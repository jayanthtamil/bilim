import React, { ChangeEvent, Fragment } from "react";
import clsx from "clsx";
import { FormControlLabel, Checkbox, Select, MenuItem, Switch } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CustomEvaluationProps, CourseElementProps, ElementPropsComponent } from "types";
import { EvaluationType } from "editor-constants";
import { BlmSubscriptInput, SubscriptInputChangeEvent } from "shared";
import { changeKeyMap } from "./utils";
import "./custom-evaluation.scss";

interface CompProps extends ElementPropsComponent<CustomEvaluationProps> {}

function BlmCustomEvaluationProps(props: CompProps) {
  const { data, onChange } = props;
  const state = data.evalutionJSON!;
  const { t } = useTranslation("properties");

  const updateChange = (newState: CustomEvaluationProps) => {
    const newData: CourseElementProps<CustomEvaluationProps> = {
      ...data,
      isEvaluation: newState.evaluation !== EvaluationType.None,
      evalutionJSON: newState,
    };

    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (event: ChangeEvent<any> | SubscriptInputChangeEvent) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    let newState: CustomEvaluationProps;

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
    } else {
      newState = {
        ...state,
        [name]: value,
      };
    }

    updateChange(newState);
  };

  return (
    <div className="custom-evaluation-props-container">
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
          <div
            className={clsx("evaluation-score-quiz-container", {
              "show-retry-quiz-options":
                state.evaluation === EvaluationType.Evaluation && state.retry_quiz.checked,
            })}
          >
            <span className="evaluation-score-lbl">{t("evaluation.success_score")}</span>
            <BlmSubscriptInput
              name="success_score"
              label="/100"
              min={1}
              max={99}
              value={state.success_score}
              className="evaluation-score-txt"
              onChange={handleChange}
            />
            <FormControlLabel
              name="retry_quiz"
              label={t("evaluation.retry_quiz")}
              control={<Checkbox />}
              checked={state.retry_quiz.checked}
              className="evaluation-retry-quiz-frm-lbl"
              onChange={handleChange}
            />
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
          </div>
          <div className="evaluation-advanced-container">
            <span className="evaluation-advanced-title">{t("evaluation.advanced")}</span>
            <FormControlLabel
              name="advanced_option1"
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

export default BlmCustomEvaluationProps;
