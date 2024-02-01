import React, { ChangeEvent, Fragment, useMemo } from "react";
import clsx from "clsx";
import { FormControlLabel, RadioGroup, Radio, Select, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MediaFile, QuestionIntroduction } from "types";
import {
  QuestionIntroductionTypes,
  AcceptedFileTypes,
  TemplateEditorOptionTypes,
  ElementType,
} from "editor-constants";
import { getTheme, isVideo } from "utils";
import { BlmSubscriptInput } from "shared";
import { BlmMediaPicker, BlmMediaPickerEditor } from "components/shared";
import { useQuestionEditorCtx } from "components/question-editor/core";
import { QuestionEditorDispatch, updateQuestionIntroduction } from "../../reducers";
import { ContainerProps } from "./container";
import "./styles.scss";

interface CompProps extends ContainerProps {
  data: QuestionIntroduction;
  dispatch: QuestionEditorDispatch;
}

function BlmQuestionIntroduction(props: CompProps) {
  const { data, themes, dispatch } = props;
  const { element } = useQuestionEditorCtx();
  const isPartpage =
    element?.type === ElementType.PartPage || element?.type === ElementType.SimplePartPage;
  const { t } = useTranslation("question-editor");

  const isAllowedTheme = useMemo(() => {
    const { isEvaluation, theme } = element?.parent || {};
    const themeObj = isEvaluation && theme && themes ? getTheme(themes, theme) : undefined;

    return themeObj ? themeObj.allowIntroduction : true;
  }, [element, themes]);
  const disableIntro = isPartpage || !isAllowedTheme;

  const handleChange = (
    event: ChangeEvent<any> | CustomChangeEvent<MediaFile | number | undefined>
  ) => {
    const { name, value } = event.target;
    const newData: QuestionIntroduction = { ...data };

    if (name === "introduction") {
      newData.introduction = value;
    } else if (name === "title") {
      newData.media.title.value = value;
    } else if (name === "description") {
      newData.media.text.value = value;
    } else if (name === "displayQuestion") {
      newData.media.display.button = false;
      newData.media.display.timer.status = false;
      newData.media.display.autoEnd = false;

      switch (value) {
        case "button":
          newData.media.display.button = true;
          break;
        case "timer":
          newData.media.display.timer.status = true;
          break;
        case "autoEnd":
          newData.media.display.autoEnd = true;
          break;
      }
    } else if (name === "timerValue") {
      newData.media.display.timer.value = value;
    } else if (name === "media") {
      newData.media.media.value = value;
    } else if (name === "sound") {
      if (value && !value.subtitle) {
        value.subtitle = newData.media?.sound?.value?.subtitle;
      }
      if (value && !value.marker) {
        value.marker = newData.media?.sound?.value?.marker;
      }
      newData.media.sound.value = value;
    } else if (name === "simpleContent") {
      newData.simpleContentId = value;
    }

    if (dispatch) {
      dispatch(updateQuestionIntroduction(newData));
    }
  };

  const renderChildren = () => {
    if (disableIntro) {
      if (isPartpage) {
        return <span className="intro-warning">{t("introduction.warning_1")}</span>;
      } else {
        return <span className="intro-warning">{t("introduction.warning_2")}</span>;
      }
    } else if (data.introduction === QuestionIntroductionTypes.Media) {
      const media = data.media;
      const display = media.display;
      let displayGrpValue = "";

      if (display.button) {
        displayGrpValue = "button";
      } else if (display.timer.status) {
        displayGrpValue = "timer";
      } else if (display.autoEnd) {
        displayGrpValue = "autoEnd";
      }

      return (
        <Fragment>
          <div className="intro-main-media-wrapper">
            <BlmMediaPicker
              name="media"
              elementId={element!.id}
              acceptedFiles={[AcceptedFileTypes.Image, AcceptedFileTypes.Video]}
              data={data.media.media.value}
              placeholder={t("label.select_media")}
              disabled={!data.media.media.isEditable}
              className="media-picker-1"
              onChange={handleChange}
            />
            <input
              name="title"
              type="text"
              value={media.title.value || ""}
              disabled={!media.title.isEditable}
              className="intro-media-title"
              onChange={handleChange}
            />
            <div className="title-hr" />
            <textarea
              name="description"
              value={media.text.value || ""}
              disabled={!media.text.isEditable}
              className="intro-media-description"
              onChange={handleChange}
            />
          </div>
          <BlmMediaPickerEditor
            name="sound"
            elementId={element!.id}
            acceptedFiles={[AcceptedFileTypes.Audio]}
            data={data.media.sound.value}
            placeholder={t("introduction.select_sound")}
            disabled={!data.media.sound.isEditable}
            className="sound-picker-1"
            onChange={handleChange}
          />
          <div className="intro-media-question-title">{t("introduction.display_ques")}</div>
          <RadioGroup
            name="displayQuestion"
            value={displayGrpValue}
            onChange={handleChange}
            className={clsx("intro-media-question-grp", displayGrpValue)}
          >
            <FormControlLabel
              label={t("introduction.button")}
              value="button"
              control={<Radio className="radio-2" />}
              className="intro-question-btn-ctrl"
            />
            <FormControlLabel
              label={t("label.timer")}
              value="timer"
              control={<Radio className="radio-2" />}
              className="intro-question-timer-ctrl"
            />
            <BlmSubscriptInput
              name="timerValue"
              label={t("label.sec")}
              min={1}
              max={60}
              value={display.timer.value || 1}
              onChange={handleChange}
            />
            {media.media.value && isVideo(media.media.value.type) && (
              <FormControlLabel
                label={t("introduction.auto_end")}
                value="autoEnd"
                control={<Radio className="radio-2" />}
                className="intro-question-video-ctrl"
              />
            )}
          </RadioGroup>
        </Fragment>
      );
    } else if (data.introduction === QuestionIntroductionTypes.SimpleContent) {
      return (
        <Select
          name="simpleContent"
          value={data.simpleContentId}
          className="intro-simple-dropdown"
          onChange={handleChange}
        >
          <MenuItem value={TemplateEditorOptionTypes.None}>{t("label.select")}</MenuItem>
          {element?.children.map((item) => {
            return (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            );
          })}
        </Select>
      );
    }
  };

  return (
    <div className="question-introduction-wrapper">
      <Select
        name="introduction"
        value={disableIntro ? QuestionIntroductionTypes.None : data.introduction}
        className="intro-dropdown"
        onChange={handleChange}
      >
        <MenuItem value={QuestionIntroductionTypes.None}>{t("introduction.none")}</MenuItem>
        <MenuItem value={QuestionIntroductionTypes.Media} disabled={disableIntro}>
          {t("introduction.media")}
        </MenuItem>
      </Select>
      {renderChildren()}
    </div>
  );
}

export default BlmQuestionIntroduction;
