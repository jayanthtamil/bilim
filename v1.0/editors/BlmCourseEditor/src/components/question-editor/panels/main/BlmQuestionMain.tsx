import React, { ChangeEvent, Fragment } from "react";
import { Select, MenuItem, FormControlLabel, Checkbox } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  CustomChangeEvent,
  LinkMedia,
  MediaFile,
  QuestionFeedback,
  QuestionIntroduction,
  QuestionMain,
} from "types";
import {
  AcceptedFileTypes,
  QuestionFeedbackTypes,
  QuestionTemplateTypes,
  TemplateEditorOptionTypes,
} from "editor-constants";
import { isQuestionCustom, isQuestionPropositions } from "utils";
import { BlmMediaPickerEditor } from "components/shared";
import { getIntroductionMedia } from "template-builders";
import { useQuestionEditorCtx } from "components/question-editor/core";
import {
  BlmLinkMedia,
  BlmQuestionPropositions,
  BlmQuestionCustom,
} from "components/question-editor/components";
import { QuestionEditorDispatch, updateQuestionMain } from "components/question-editor/reducers";
import "./styles.scss";

interface CompProps {
  type: QuestionTemplateTypes;
  introduction: QuestionIntroduction;
  data: QuestionMain;
  feedback: QuestionFeedback;
  dispatch: QuestionEditorDispatch;
}

function BlmQuestionMain(props: CompProps) {
  const { type, introduction, data, feedback, dispatch } = props;
  const { element } = useQuestionEditorCtx();
  const { title, text, media, sound, simpleContent, instruction, validate, content } = data;
  const introMedia = getIntroductionMedia(introduction);
  const hasFBProps = feedback.type === QuestionFeedbackTypes.Propositions;
  const { t } = useTranslation("question-editor");

  const updateChange = (newData: QuestionMain) => {
    if (dispatch) {
      dispatch(updateQuestionMain(newData));
    }
  };

  const handleChange = (
    event: ChangeEvent<any> | CustomChangeEvent<MediaFile | LinkMedia | undefined>
  ) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData: QuestionMain = { ...data };

    if (name === "title") {
      newData.title.value = value;
    } else if (name === "description") {
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
    } else if (name === "instruction") {
      newData.instruction.value = value;
    } else if (name === "validate") {
      newData.validate.checked = value;
    }

    updateChange(newData);
  };

  const renderChildren = () => {
    if (isQuestionPropositions(content) && content.value) {
      return (
        <BlmQuestionPropositions
          data={content.value}
          isEditable={content.isEditable}
          hasFBProbisitions={hasFBProps}
          dispatch={dispatch}
        />
      );
    } else if (isQuestionCustom(content)) {
      return <BlmQuestionCustom data={content} dispatch={dispatch} />;
    }
  };

  return (
    <div className="question-main-wrapper">
      {type !== QuestionTemplateTypes.NoHeader && (
        <Fragment>
          <div className="main-media-wrapper">
            <BlmLinkMedia
              name="media"
              elementId={element!.id}
              data={media.value}
              linkMedia={introMedia}
              isEditable={media.isEditable}
              onChange={handleChange}
            />
            <input
              name="title"
              type="text"
              value={title.value || ""}
              disabled={!title.isEditable}
              className="main-media-title"
              onChange={handleChange}
            />
            <div className="main-media-title-hr" />
            <textarea
              name="description"
              placeholder={t("main.add_desc")}
              value={text.value || ""}
              disabled={!text.isEditable}
              className="main-media-description"
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
          />
          <Select
            name="simpleContent"
            value={simpleContent.value}
            disabled={!simpleContent.isEditable}
            className="main-simple-dropdown simple-content-select"
            onChange={handleChange}
          >
            <MenuItem value={TemplateEditorOptionTypes.None}>
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
          {type === QuestionTemplateTypes.Standard ? (
            <input
              name="instruction"
              type="text"
              value={instruction.value || ""}
              disabled={!instruction.isEditable}
              className="main-media-instruction"
              onChange={handleChange}
            />
          ) : (
            <FormControlLabel
              name="validate"
              label={t("main.show_validate")}
              control={<Checkbox className="checkbox-3" />}
              checked={validate.checked}
              className="main-media-validate"
              onChange={handleChange}
            />
          )}
        </Fragment>
      )}
      {renderChildren()}
    </div>
  );
}

export default BlmQuestionMain;
