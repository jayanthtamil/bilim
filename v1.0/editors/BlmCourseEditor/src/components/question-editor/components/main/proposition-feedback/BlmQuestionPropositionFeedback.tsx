import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import { QuestionPropositionFeedback } from "types";
import { AcceptedFileTypes } from "editor-constants";
import { BlmMediaPicker, MediaPickerChangeEvent, BlmMediaPickerEditor } from "components/shared";
import { useQuestionEditorCtx } from "components/question-editor/core";
import "./styles.scss";

export interface CompProps {
  data: QuestionPropositionFeedback;
  onChange: (data: QuestionPropositionFeedback) => void;
}

function BlmQuestionPropositionFeedback(props: CompProps) {
  const { data, onChange } = props;
  const { title, text, media, sound } = data;
  const { element } = useQuestionEditorCtx();
  const { t } = useTranslation("question-editor");

  const handleChange = (event: ChangeEvent<any> | MediaPickerChangeEvent) => {
    const { name, value } = event.target;
    const newData: QuestionPropositionFeedback = { ...data };

    if (name === "title") {
      newData.title.value = value;
    } else if (name === "text") {
      newData.text.value = value;
    } else if (name === "media") {
      newData.media.value = value;
    } else if (name === "sound") {
      if (value && !value.subtitle) {
        value.subtitle = newData.sound?.value?.subtitle;
      }
      if (value && !value.marker) {
        value.marker = newData.sound?.value?.marker;
      }
      newData.sound.value = value;
    }

    if (onChange) {
      onChange(newData);
    }
  };

  return (
    <div className="question-proposition-feedback-wrapper">
      <div className="question-proposition-feedback-media">
        <BlmMediaPicker
          name="media"
          elementId={element!.id}
          acceptedFiles={[AcceptedFileTypes.Image, AcceptedFileTypes.Video]}
          data={media.value}
          placeholder={t("main.no_media")}
          disabled={!media.isEditable}
          className="media-picker-2"
          onChange={handleChange}
        />
        <BlmMediaPickerEditor
          name="sound"
          elementId={element!.id}
          acceptedFiles={[AcceptedFileTypes.Audio]}
          data={sound.value}
          placeholder={t("label.no_sound")}
          disabled={!sound.isEditable}
          className="sound-picker-2"
          onChange={handleChange}
        />
      </div>
      <input
        type="text"
        name="title"
        className="question-proposition-feedback-title"
        value={title.value || ""}
        disabled={!title.isEditable}
        onChange={handleChange}
      />
      <div className="question-proposition-feedback-title-hr" />
      <textarea
        name="text"
        className="question-proposition-feedback-description"
        value={text.value || ""}
        disabled={!text.isEditable}
        onChange={handleChange}
      />
    </div>
  );
}

export default BlmQuestionPropositionFeedback;
