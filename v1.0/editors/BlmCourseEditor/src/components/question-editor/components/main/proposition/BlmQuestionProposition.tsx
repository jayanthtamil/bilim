import React, {
  useState,
  ChangeEvent,
  MouseEvent,
  memo,
  forwardRef,
  ForwardRefRenderFunction,
  HTMLAttributes,
} from "react";
import clsx from "clsx";
import { Checkbox, Collapse } from "@material-ui/core";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";

import { QuestionProposition, QuestionPropositionInfo, QuestionPropositionFeedback } from "types";
import { AcceptedFileTypes } from "editor-constants";
import { deepCopy } from "utils";
import { BlmMediaPicker, MediaPickerChangeEvent, BlmMediaPickerEditor } from "components/shared";
import { useQuestionEditorCtx } from "components/question-editor/core";
import {
  QuestionEditorDispatch,
  updateQuestionProposition,
  deleteQuestionProposition,
} from "components/question-editor/reducers";
import BlmQuestionPropositionInfo from "../proposition-info";
import BlmQuestionPropositionFeedback from "../proposition-feedback";

import "./styles.scss";

interface CompProps extends HTMLAttributes<HTMLDivElement> {
  drag: DraggableProvidedDragHandleProps | undefined;
  data: QuestionProposition;
  isDeletable: boolean;
  showFeedback?: boolean;
  dispatch: QuestionEditorDispatch;
}

const BlmQuestionProposition: ForwardRefRenderFunction<HTMLDivElement, CompProps> = (
  props,
  ref
) => {
  const { drag, isDeletable, data, showFeedback = false, className, dispatch, ...others } = props;
  const { title, text, media, sound, validity, info, feedback } = data;
  const [isExpaned, setIsExpanded] = useState(false);
  const { element } = useQuestionEditorCtx();
  const { t } = useTranslation("question-editor");

  const updateChange = (newData: QuestionProposition) => {
    if (dispatch) {
      dispatch(updateQuestionProposition(newData));
    }
  };

  const handleChange = (event: ChangeEvent<any> | MediaPickerChangeEvent) => {
    const { target } = event;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData: QuestionProposition = deepCopy(data);

    if (name === "validity") {
      newData.validity.value = value;
    } else if (name === "title") {
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

    updateChange(newData);
  };

  const handleInfoChange = (info: QuestionPropositionInfo) => {
    const newData: QuestionProposition = {
      ...data,
      info: { ...data.info, value: info },
    };

    updateChange(newData);
  };

  const handleFeedbackChange = (feedback: QuestionPropositionFeedback) => {
    const newData = { ...data, feedback };

    updateChange(newData);
  };

  const handleDeleteClick = (event: MouseEvent) => {
    if (isDeletable && dispatch) {
      dispatch(deleteQuestionProposition(data));
    }
  };

  const handleExpandClick = (event: MouseEvent) => {
    setIsExpanded((prevValue) => !prevValue);
  };

  return (
    <div
      ref={ref}
      className={clsx("question-proposition-wrapper", className, {
        expanded: isExpaned,
      })}
      {...others}
    >
      <div className="question-proposition-main">
        <div className="question-proposition-media">
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
            showDesign="showDesign"
          />
        </div>
        <Checkbox
          name="validity"
          checked={validity.value || false}
          disabled={!validity.isEditable}
          className="checkbox-2"
          onChange={handleChange}
        />
        <input
          type="text"
          name="title"
          value={title.value || ""}
          disabled={!title.isEditable}
          className="question-proposition-title"
          onChange={handleChange}
        />
        <div className="question-proposition-title-hr" />
        <textarea
          name="text"
          value={text.value || ""}
          disabled={!text.isEditable}
          className="question-proposition-description"
          onChange={handleChange}
        />
        <div
          className={clsx("question-proposition-delete-btn", {
            disabled: !isDeletable,
          })}
          onClick={handleDeleteClick}
        />
        <div className="question-proposition-expand-btn" onClick={handleExpandClick} />
      </div>
      <div className="question-proposition-drag-box" {...drag} />
      <Collapse in={isExpaned} className="question-proposition-collapse">
        {info.value && (
          <BlmQuestionPropositionInfo
            data={info.value}
            isEditable={info.isEditable}
            onChange={handleInfoChange}
          />
        )}
        {showFeedback && (
          <BlmQuestionPropositionFeedback data={feedback} onChange={handleFeedbackChange} />
        )}
      </Collapse>
    </div>
  );
};

export default memo(forwardRef(BlmQuestionProposition));
