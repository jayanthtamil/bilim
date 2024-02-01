import React, { ChangeEvent } from "react";
import clsx from "clsx";
import { Select, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { QuestionGlobalFeedbackItem } from "types";
import { AcceptedFileTypes, QuestionFeedbackTypes } from "editor-constants";
import { BlmMediaPicker, MediaPickerChangeEvent, BlmMediaPickerEditor } from "components/shared";
import { useQuestionEditorCtx } from "components/question-editor/core";
import "./styles.scss";

interface CompProps {
  type: QuestionFeedbackTypes;
  header: string;
  data: QuestionGlobalFeedbackItem;
  className?: string;
  onChange: (data: QuestionGlobalFeedbackItem) => void;
}

function BlmGobalItem(props: CompProps) {
  const { type, header, data, className, onChange } = props;
  const { title, text, media, sound, simpleContent } = data;
  const { element } = useQuestionEditorCtx();
  const isFlap = type === QuestionFeedbackTypes.Flap;
  const { t } = useTranslation("question-editor");

  const handleChange = (event: ChangeEvent<any> | MediaPickerChangeEvent) => {
    const { name, value } = event.target;
    const newData = { ...data };

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
    } else if (name === "simpleContent") {
      newData.simpleContent.value = value;
    }

    if (onChange) {
      onChange(newData);
    }
  };

  return (
    <div className={clsx("global-feedback-item-wrapper", type, className)}>
      <div className="global-feedback-item-header">{header}</div>
      <div className="global-feedback-item-grid-box">
        {isFlap && (
          <BlmMediaPicker
            name="media"
            elementId={element!.id}
            acceptedFiles={[AcceptedFileTypes.Image, AcceptedFileTypes.Video]}
            data={media.value}
            placeholder={t("label.select_media")}
            disabled={!media.isEditable}
            className="media-picker-1"
            onChange={handleChange}
          />
        )}
        <div className="global-feedback-item-text-box">
          <input
            name="title"
            type="text"
            value={title.value || ""}
            disabled={!title.isEditable}
            className="global-feedback-item-title"
            onChange={handleChange}
          />
          <div className="global-feedback-item-hr" />
          <textarea
            name="text"
            value={text.value || ""}
            disabled={!text.isEditable}
            className="global-feedback-item-desc"
            onChange={handleChange}
          />
        </div>
        <BlmMediaPickerEditor
          name="sound"
          elementId={element!.id}
          acceptedFiles={[AcceptedFileTypes.Audio]}
          data={sound.value}
          placeholder={t("label.no_sound")}
          disabled={!sound.isEditable}
          className="sound-picker-1"
          onChange={handleChange}
          showDesign="showDesign"
        />
        {isFlap && (
          <Select
            name="simpleContent"
            value={simpleContent.value}
            disabled={!simpleContent.isEditable}
            className="simple-content-select"
            onChange={handleChange}
          >
            <MenuItem value="none">
              <div className="simple-content-item">
                <div className="item-none-icon" />
                <div className="item-none-lbl">{t("label.no_simple_content")}</div>
              </div>
            </MenuItem>
            {element?.children.map((item) => {
              return (
                <MenuItem key={item.id} value={item.id}>
                  <div className="simple-content-item">
                    <div className="item-icon" />
                    <div className="item-lbl">{item.name}</div>
                  </div>
                </MenuItem>
              );
            })}
          </Select>
        )}
      </div>
    </div>
  );
}

export default BlmGobalItem;
