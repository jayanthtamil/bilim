import React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { QuestionGlobalFeedback, QuestionGlobalFeedbackItem } from "types";
import { QuestionFeedbackTypes } from "editor-constants";
import BlmGobalFeedbackItem from "../global-item";
import "./styles.scss";

export interface CompProps {
  type: QuestionFeedbackTypes;
  data: QuestionGlobalFeedback;
  onChange: (data: QuestionGlobalFeedback) => void;
}

function BlmGlobalFeedback(props: CompProps) {
  const { type, data, onChange } = props;
  const { right, wrong } = data;
  const { t } = useTranslation("question-editor");

  const handleChange = (item: QuestionGlobalFeedbackItem, isRight: boolean) => {
    const newData = { ...data };

    if (isRight) {
      newData.right = item;
    } else {
      newData.wrong = item;
    }

    if (onChange) {
      onChange(newData);
    }
  };

  return (
    <div className={clsx("global-feedback-wrapper", type)}>
      <BlmGobalFeedbackItem
        type={type}
        header={t("feedback.title.right_ans")}
        data={right}
        onChange={(newData) => handleChange(newData, true)}
        className="right"
      />
      <div className="global-feedback-hr" />
      <BlmGobalFeedbackItem
        type={type}
        header={t("feedback.title.wrong_ans")}
        data={wrong}
        onChange={(newData) => handleChange(newData, false)}
        className="wrong"
      />
    </div>
  );
}

export default BlmGlobalFeedback;
