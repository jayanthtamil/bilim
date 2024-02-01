import React, { Fragment, PropsWithChildren } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { QuestionFeedbackTypes } from "editor-constants";
import "./styles.scss";

export interface CompProps {
  label: string;
  type: QuestionFeedbackTypes;
  disabled?: boolean;
}

function BlmFeedbackDashboard(props: PropsWithChildren<CompProps>) {
  const { label, type, children } = props;
  const { t } = useTranslation("question-editor");

  return (
    <Fragment>
      <div className="feedback-tab-header">
        <div className="popup">{t("feedback.tabs.dashboard.popup")}</div>
        <div className="popup-plus">{t("feedback.tabs.dashboard.popup+")}</div>
        <div className="simple-content">{t("feedback.tabs.dashboard.simple_content")}</div>
      </div>
      <div className={clsx("feedback-thumbnail-wrapper", type)}>
        <div className="feedback-thumbnail-img" />
        <div className="feedback-thumbnail-title">{label}</div>
        <div className="feedback-thumbnail-lbl">{t("feedback.tabs.dashboard.load")}</div>
      </div>
      {children}
    </Fragment>
  );
}

export default BlmFeedbackDashboard;
