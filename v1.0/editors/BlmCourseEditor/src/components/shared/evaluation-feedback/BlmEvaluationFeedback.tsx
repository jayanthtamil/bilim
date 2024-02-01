import React, { ChangeEvent } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, EvaluationFeedbackProps, Threshold } from "types";
import { FeedbackDisplayType } from "editor-constants";
import { BlmSubscriptInput, SubscriptInputChangeEvent } from "shared";
import BlmFeedbackSlider from "../feedback-slider";
import BlmFeedbackDisplay from "../feedback-display";
import { getScoreThreshold } from "./utils";
import "./styles.scss";

export type EvaluationFeedbackChangeEvent = {
  target: {
    name: "feedback" | "feedback_display";
    value: { score: number; feedback: EvaluationFeedbackProps } | FeedbackDisplayType;
  };
};

interface CompProps {
  element: CourseElement;
  score: number;
  feedback: EvaluationFeedbackProps;
  display?: FeedbackDisplayType;
  onChange: (event: EvaluationFeedbackChangeEvent) => void;
}

function BlmEvaluationFeedback(props: CompProps) {
  const { element, score, feedback, display, onChange } = props;
  const { checked, thresholds } = feedback;
  const { t } = useTranslation("shared");

  const updateChange = (event: EvaluationFeedbackChangeEvent) => {
    if (onChange) {
      onChange(event);
    }
  };

  const handleChange = (event: ChangeEvent<any> | SubscriptInputChangeEvent) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    let newEvent: EvaluationFeedbackChangeEvent | undefined;

    if (name === "score") {
      let successThresold = getScoreThreshold(thresholds);
      let newThresholds = [...thresholds];
      const ind = successThresold ? newThresholds.indexOf(successThresold) : -1;

      if (ind !== -1) {
        successThresold = {
          ...successThresold,
          threshold: value,
        } as Threshold;

        newThresholds.splice(ind, 1, successThresold);

        //BIL-467:[React] Evaluation - Success score overlap intermediare feedback
        //BILIM-30[React] Evaluation - Success score overlap intermediary feedback
        newEvent = updateIntermediateThresholds(ind - 1, successThresold.threshold, newThresholds);
      }
    } else if (name === "feedback") {
      newEvent = {
        target: {
          name,
          value: { score, feedback: { ...feedback, checked: value } },
        },
      };
    } else {
      newEvent = { target: { name, value } };
    }

    if (newEvent) {
      updateChange(newEvent);
    }
  };

  const handleSliderChange = (thresholds: Threshold[]) => {
    const successThreshold = getScoreThreshold(thresholds);
    const newEvent = createEvent(thresholds, successThreshold?.threshold);

    updateChange(newEvent);
  };

  const updateIntermediateThresholds = (
    ind: number,
    successScore: number,
    thresholds: Threshold[]
  ) => {
    if (ind > 0 && ind < thresholds.length) {
      let intermediate = thresholds[ind];

      if (intermediate.threshold > successScore) {
        intermediate = { ...intermediate };
        intermediate.threshold = Math.floor(successScore / 2);

        thresholds.splice(ind, 1, intermediate);
      }
    }

    return createEvent(thresholds, successScore);
  };

  const createEvent = (
    thresholds: Threshold[],
    newscore?: number
  ): EvaluationFeedbackChangeEvent => {
    return {
      target: {
        name: "feedback",
        value: {
          score: newscore || score,
          feedback: { ...feedback, thresholds },
        },
      },
    };
  };

  return (
    <div className="evaluation-feedback-wrapper">
      <div className="evaluation-score-lbl">{t("evaluation_feedback.success_score")}</div>
      <BlmSubscriptInput
        name="score"
        label="/100"
        min={1}
        max={99}
        value={score}
        className="evaluation-score-txt"
        onChange={handleChange}
      />
      <FormControlLabel
        name="feedback"
        label={t("evaluation_feedback.title")}
        control={<Checkbox />}
        checked={checked}
        className="evaluation-feedback-frm-lbl"
        onChange={handleChange}
      />
      {checked && (
        <BlmFeedbackSlider
          element={element}
          thresholds={thresholds}
          onChange={handleSliderChange}
        />
      )}
      {display && checked && (
        <BlmFeedbackDisplay
          name="feedback_display"
          value={display}
          className="evaluation-feedback-display-dropdown"
          onChange={handleChange}
        />
      )}
    </div>
  );
}

export default BlmEvaluationFeedback;
