import React, { ChangeEvent } from "react";
import { Select, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  QuestionFeedback,
  QuestionGlobalFeedback,
  QuestionMain,
  QuestionDetailedFeedback,
} from "types";
import { QuestionFeedbackTypes } from "editor-constants";
import { isQuestionPropositions } from "utils";
import { Tabs } from "shared/material-ui";
import {
  BlmGlobalFeedback,
  BlmDetailedFeedback,
  BlmFeedbackDashboard,
} from "components/question-editor/components";
import {
  QuestionEditorDispatch,
  updateQuestionFeedback,
} from "components/question-editor/reducers";
import "./styles.scss";

interface CompProps {
  data: QuestionFeedback;
  main: QuestionMain;
  dispatch: QuestionEditorDispatch;
}

const getFeedbackType = (data: QuestionFeedback, isSCQ: boolean) => {
  switch (data.type) {
    case QuestionFeedbackTypes.Basic:
    case QuestionFeedbackTypes.Embedded:
    case QuestionFeedbackTypes.Flap:
    case QuestionFeedbackTypes.Detailed:
      return QuestionFeedbackTypes.Global;
    default:
      return isSCQ ? data.type : QuestionFeedbackTypes.None;
  }
};

const tabs = [
  QuestionFeedbackTypes.Basic,
  QuestionFeedbackTypes.Embedded,
  QuestionFeedbackTypes.Flap,
  QuestionFeedbackTypes.Detailed,
];

const getTabPanelIndex = (data: QuestionFeedback) => {
  const ind = tabs.findIndex((item) => item === data.tabType);

  return ind !== -1 ? ind : 0;
};

function BlmQuestionFeedback(props: CompProps) {
  const { data, main, dispatch } = props;
  const { disableEmbedded } = data;
  const isSCQ = (isQuestionPropositions(main.content) && main.content.value?.isMCQ) || false;
  const type = getFeedbackType(data, !isSCQ);
  const { t } = useTranslation("question-editor");

  const updateChange = (newData: QuestionFeedback) => {
    if (dispatch) {
      dispatch(updateQuestionFeedback(newData));
    }
  };

  const handleChange = (event: ChangeEvent<any>) => {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    const newData: QuestionFeedback = { ...data };

    if (name === "type") {
      if (value === QuestionFeedbackTypes.Global) {
        newData.type = QuestionFeedbackTypes.Basic;
      } else {
        newData.type = value;
      }
    }

    updateChange(newData);
  };

  const handleTabChange = (index: number) => {
    const newData = { ...data };

    newData.type = tabs[index];
    newData.tabType = newData.type;

    updateChange(newData);
  };

  const handleGlobalChange = (global: QuestionGlobalFeedback) => {
    const newData = { ...data };

    newData.global = global;

    updateChange(newData);
  };

  const handleDetailedChange = (detailed: QuestionDetailedFeedback) => {
    const newData = { ...data };

    newData.detailed = detailed;

    updateChange(newData);
  };

  const renderTabPanel = () => {
    const selectedIndex = getTabPanelIndex(data);
    const { global, detailed } = data;

    return (
      <Tabs
        selectedIndex={selectedIndex}
        className="question-feedback-tab-panel"
        onTabChange={handleTabChange}
      >
        <BlmFeedbackDashboard label={t("feedback.tabs.basic")} type={QuestionFeedbackTypes.Basic}>
          <BlmGlobalFeedback
            data={global}
            type={QuestionFeedbackTypes.Basic}
            onChange={handleGlobalChange}
          />
        </BlmFeedbackDashboard>
        <BlmFeedbackDashboard
          label={t("feedback.tabs.embedded")}
          type={QuestionFeedbackTypes.Embedded}
          disabled={disableEmbedded}
        >
          <BlmGlobalFeedback
            type={QuestionFeedbackTypes.Embedded}
            data={global}
            onChange={handleGlobalChange}
          />
        </BlmFeedbackDashboard>
        <BlmFeedbackDashboard label={t("feedback.tabs.flap")} type={QuestionFeedbackTypes.Flap}>
          <BlmGlobalFeedback
            type={QuestionFeedbackTypes.Flap}
            data={global}
            onChange={handleGlobalChange}
          />
        </BlmFeedbackDashboard>
        <BlmFeedbackDashboard
          label={t("feedback.tabs.detailed")}
          type={QuestionFeedbackTypes.Detailed}
        >
          <BlmDetailedFeedback data={detailed} onChange={handleDetailedChange} />
        </BlmFeedbackDashboard>
      </Tabs>
    );
  };

  return (
    <div className="question-feedback-wrapper">
      <Select
        name="type"
        value={type}
        className="question-feedback-dropdown"
        onChange={handleChange}
      >
        <MenuItem value={QuestionFeedbackTypes.None}>{t("feedback.feedback_opt.none")}</MenuItem>
        {!isSCQ && (
          <MenuItem value={QuestionFeedbackTypes.Propositions}>
            {t("feedback.feedback_opt.per_posiotion")}
          </MenuItem>
         )} 
        <MenuItem value={QuestionFeedbackTypes.Global}>
          {t("feedback.feedback_opt.global_feedback")}
        </MenuItem>
      </Select>
      {type === QuestionFeedbackTypes.Propositions && (
        <div className="question-feedback-proposition">
          <div className="question-feedback-proposition-icon" />
          <div className="question-feedback-proposition-text">
            {t("feedback.feedback_opt.fill_up")}
          </div>
        </div>
      )}
      {type === QuestionFeedbackTypes.Global && renderTabPanel()}
    </div>
  );
}

export default BlmQuestionFeedback;
