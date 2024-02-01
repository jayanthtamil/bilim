import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import {
  ComponentStyle,
  CustomChangeEvent,
  MediaFile,
  ComponentAction,
  ButtonComponent,
  ButtonValue,
  ContentTemplateAction,
} from "types";
import { StyleListTypes, AcceptedFileTypes } from "editor-constants";
import { BlmMediaFormat, BlmMediaPicker, MediaFormatChangeEvent } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateButtonComponent } from "components/content-editor/reducers";
import BlmActions, { BlmSwitchActions } from "../actions";
import { BlmStyleTintPicker } from "../styles";
import "./styles.scss";

export interface CompProps {
  data: ButtonComponent;
  temp: ContentTemplateAction | undefined;
}

const NUMBER_REG = /^$|^[\d\b]+$/;

function BlmButton(props: CompProps) {
  const { data, temp } = props;
  const { element, dispatch } = useContentEditorCtx();
  const { value: button, hasApplyStyle, buttonOptions } = data;
  const { format, config } = buttonOptions;
  const {
    // background,
    inline,
    // label,
    // number,
    title,
    description,
    caption,
    clickAction,
    overAction,
    style,
  } = button;
  const { t } = useTranslation("content-editor");

  const updateChange = (newButton: ButtonValue) => {
    const newData = { ...data, value: newButton };

    if (dispatch) {
      dispatch(updateButtonComponent(newData));
    }
  };

  const handleChange = (
    event:
      | ChangeEvent<{ name: string; value: any }>
      | CustomChangeEvent<MediaFile | ComponentAction | ComponentStyle | undefined>
  ) => {
    const { name, value } = event.target;
    const newButton = { ...button };

    if (
      name === "background" ||
      name === "inline" ||
      name === "title" ||
      name === "description" ||
      name === "caption" ||
      name === "label" ||
      (name === "number" && NUMBER_REG.test(value)) ||
      name === "clickAction" ||
      name === "overAction" ||
      name === "style"
    ) {
      newButton[name] = value;
    }

    updateChange(newButton);
  };

  const handleMediaFormatChange = (event: MediaFormatChangeEvent) => {
    const { name, value } = event.target;
    const newData = { ...data };

    if (name === "format") {
      if (value.value === "auto") {
        value.width = 0;
      } else {
        if (value.width === 0) {
          value.width = value.defaultWidth;
        }
      }
      newData.buttonOptions.format = value;
    }

    if (dispatch) {
      dispatch(updateButtonComponent(newData));
    }
  };

  const handleSwitchClick = () => {
    const newButton = { ...button };

    newButton.clickAction = button.overAction;
    newButton.overAction = button.clickAction;

    updateChange(newButton);
  };

  return (
    <div className="content-button-wrapper">
      <div className="button-params-wrapper">
        <div className="button-params-title">{t("title.parameters")}</div>
        <BlmMediaFormat
          data={format}
          formats={config?.format}
          onChange={handleMediaFormatChange}
          isButtonFormater={true}
        />
        <div className="new_button-params-list-wrapper">
          <div className="button-params-txt-wrapper">
            <input
              type="text"
              name="title"
              placeholder={t("label.title")}
              value={title}
              className="button-params-title-txt"
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder={t("label.description")}
              value={description}
              className="button-params-desc-txt"
              onChange={handleChange}
            />
            <textarea
              name="caption"
              placeholder={t("label.caption")}
              value={caption}
              className="button-params-caption-txt"
              onChange={handleChange}
            />
          </div>
          <div className="button-params-item-wrapper">
            <div className="button-params-item-title">Icon</div>
            <BlmMediaPicker
              name="inline"
              elementId={element!.id}
              acceptedFiles={[AcceptedFileTypes.Image]}
              data={inline}
              placeholder="Select media"
              className="media-picker-3"
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      <div className="button-actions-wrapper">
        <div className="button-actions-title">{t("label.action")}</div>
        <div className="button-actions-lbl">
          {t("label.on")} <span className="button-actions-bold-lbl">{t("label.click")}</span>
        </div>
        <div className="button-actions-lbl">
          On <span className="button-actions-bold-lbl">{t("label.roll_over")}</span>
        </div>
        <BlmActions name="clickAction" data={clickAction} temp={temp} onChange={handleChange} />
        <BlmSwitchActions
          left={clickAction}
          right={overAction}
          rightType="over"
          onClick={handleSwitchClick}
        />
        <BlmActions name="overAction" data={overAction} type="over" onChange={handleChange} />
      </div>
      <div className="button-styles-wrapper">
        <div className="button-styles-title">{t("title.style")}</div>
        <BlmStyleTintPicker
          type={StyleListTypes.Button}
          name="style"
          data={style}
          label={t("button.apply_button")}
          showApplyStyle={hasApplyStyle}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default BlmButton;
