import React, { ChangeEvent } from "react";
import { FormControlLabel, RadioGroup, Radio } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { QuestionDetailedFeedback } from "types";
import { DetailedFeedbackDisplayTypes } from "editor-constants";
import BlmDetailedFeedbackItem from "../detailed-item";
import "./styles.scss";

export interface CompProps {
  data: QuestionDetailedFeedback;
  onChange: (data: QuestionDetailedFeedback) => void;
}

function BlmDetailedFeedback(props: CompProps) {
  const { data, onChange } = props;
  const { rightId, wrongId, display } = data;
  const { t } = useTranslation("question-editor");

  const handleChange = (event: ChangeEvent<any>) => {
    const target = event.target;
    const { name, value } = target;
    const newData = { ...data };

    if (name === "right") {
      newData.rightId = value;
    } else if (name === "wrong") {
      newData.wrongId = value;
    } else if (name === "display") {
      newData.display = value;
    }

    if (onChange) {
      onChange(newData);
    }
  };

  return (
    <div className="detailed-feedback-wrapper">
      <BlmDetailedFeedbackItem
        name="right"
        title={t("feedback.title.right_ans")}
        simpleContentId={rightId}
        onChange={handleChange}
      />
      <BlmDetailedFeedbackItem
        name="wrong"
        title={t("feedback.title.wrong_ans")}
        simpleContentId={wrongId}
        onChange={handleChange}
      />
      <RadioGroup
        aria-label={t("feedback.list.display")}
        name="display"
        value={display}
        className="detailed-feedback-options"
        onChange={handleChange}
      >
        <FormControlLabel
          label={t("feedback.list.popup")}
          control={<Radio className="radio-3" />}
          value={DetailedFeedbackDisplayTypes.Popup}
        />
        <FormControlLabel
          label={t("feedback.list.below_template")}
          control={<Radio className="radio-3" />}
          value={DetailedFeedbackDisplayTypes.Below}
        />
      </RadioGroup>
    </div>
  );
}

export default BlmDetailedFeedback;
