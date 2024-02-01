import React from "react";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MediaFile, MediaFormat, QuestionCustomComponent } from "types";
import { BlmAnimation, BlmMediaFormat } from "components/shared";
import { useQuestionEditorCtx } from "components/question-editor/core";
import { QuestionEditorDispatch, updateQuestionCustom } from "components/question-editor/reducers";
import "./styles.scss";

export interface CompProps {
  data: QuestionCustomComponent;
  dispatch: QuestionEditorDispatch;
}

function BlmQuestionCustom(props: CompProps) {
  const { data, dispatch } = props;
  const { element } = useQuestionEditorCtx();
  const { format, config, value } = data;
  const { t } = useTranslation("question-editor");

  const updateChange = (newData: QuestionCustomComponent) => {
    if (dispatch) {
      dispatch(updateQuestionCustom(newData));
    }
  };

  const handleChange = (event: CustomChangeEvent<MediaFormat | MediaFile | undefined>) => {
    const { name, value } = event.target;
    const newData = { ...data };

    if (name === "format") {
      newData.format = value as MediaFormat;
    } else if (name === "media") {
      newData.value = value as MediaFile;
    }

    updateChange(newData);
  };

  return (
    <div className="question-custom-wrapper">
      <div className="question-custom-title">{t("main.custom")}</div>
      <BlmMediaFormat data={format} formats={config?.format} onChange={handleChange} />
      <BlmAnimation elementId={element!.id} data={value} onChange={handleChange} />
    </div>
  );
}

export default BlmQuestionCustom;
