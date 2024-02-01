import React, { ChangeEvent } from "react";
import { ListItemIcon, ListItemText, MenuItem, Select } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  ComponentStyle,
  MediaButton,
  CustomChangeEvent,
  MediaComponent,
  MediaFile,
  ComponentAction,
  ContentTemplateAction,
} from "types";
import {
  StyleListTypes,
  AcceptedFileTypes,
  ImageDisplayTypes,
  Positions,
  MediaPosition,
  MediaBackgroundPosition,
} from "editor-constants";
import { CoverOptionIcon, ContainOptionIcon, NoResizeOptionIcon } from "assets/icons";
import { getMediaButton } from "utils";
import { BlmMediaPicker } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import BlmActions, { BlmSwitchActions } from "../../actions";
import { BlmStyleTintPicker } from "../../styles";
import BlmMediaDashboard from "../dashboard";
import { BlmPosition } from "shared";
import "./styles.scss";

export interface CompProps {
  label: string;
  data: MediaComponent;
  temp?: ContentTemplateAction | undefined;
}

const NUMBER_REG = /^$|^[\d\b]+$/;

function BlmMediaButton(props: CompProps) {
  const { data, temp } = props;
  const state = getMediaButton(data);
  const { element, dispatch } = useContentEditorCtx();
  const { value: button, hasApplyStyle } = state;
  const {
    out,
    over,
    click,
    icon,
    title,
    description,
    caption,
    label,
    number,
    duration,
    option,
    clickAction,
    overAction,
    style,
    position,
  } = button;
  const { t } = useTranslation("content-editor");
  const [restoreValue, setRestoreValue] = React.useState(undefined);

  const buttonType = element?.isSummary
    ? StyleListTypes.MediaButtonSummary
    : StyleListTypes.MediaButton;

  const updateChange = (newButton: MediaButton) => {
    const newData = {
      ...state,
      value: newButton,
    };

    if (newData.value.clickAction.value !== undefined) {
      let value: any = newData.value.clickAction.value;
      setRestoreValue(value.restore);
      delete value.restore;
    }

    if (newData.value.overAction.value) {
      let value: any = newData.value.overAction.value;
      if (value.restore === undefined) {
        value.restore = restoreValue !== undefined ? restoreValue : true;
      }
    }

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const handleChange = (
    event:
      | ChangeEvent<any>
      | CustomChangeEvent<
          | MediaFile
          | ComponentAction
          | MediaPosition
          | Positions
          | MediaBackgroundPosition
          | ComponentStyle
          | undefined
        >
  ) => {
    const {
      name,
      value,
    }: {
      name: string;
      value: any;
    } = event.target;
    const newButton = { ...button };

    if (
      name === "out" ||
      name === "over" ||
      name === "click" ||
      name === "icon" ||
      name === "title" ||
      name === "description" ||
      name === "caption" ||
      name === "label" ||
      (name === "number" && NUMBER_REG.test(value)) ||
      name === "duration" ||
      name === "option" ||
      name === "clickAction" ||
      name === "overAction" ||
      name === "style"
    ) {
      newButton[name] = value;
    } else if (name === "position") {
      newButton[name] = value;
    }

    if (
      newButton.out === undefined &&
      newButton.over === undefined &&
      newButton.click === undefined
    ) {
      newButton.style.bgTint = undefined;
      newButton.style.tint = undefined;
    }

    updateChange(newButton);
  };

  const handleSwitchClick = () => {
    const newButton = { ...button };

    newButton.clickAction = button.overAction;
    newButton.overAction = button.clickAction;

    updateChange(newButton);
  };

  return (
    <BlmMediaDashboard data={state}>
      <div className="content-media-button-wrapper">
        <div className="button-params-wrapper">
          <div className="button-params-title">{t("title.parameters")}</div>
          <div className="button-params-list-wrapper">
            <div className="button-params-item-wrapper">
              <div className="button-params-item-title">{t("title.out")}</div>
              <BlmMediaPicker
                name="out"
                elementId={element!.id}
                acceptedFiles={[AcceptedFileTypes.Image]}
                data={out}
                placeholder="Select media"
                className="media-picker-3"
                onChange={handleChange}
              />
            </div>
            <div className="button-params-item-wrapper">
              <div className="button-params-item-title">{t("title.over")}</div>
              <BlmMediaPicker
                name="over"
                elementId={element!.id}
                acceptedFiles={[AcceptedFileTypes.Image, AcceptedFileTypes.Video]}
                data={over || out}
                placeholder="Select media"
                isLinked={!Boolean(over)}
                className="media-picker-3"
                onChange={handleChange}
              />
            </div>
            <div className="button-params-item-wrapper">
              <div className="button-params-item-title">{t("label.click")}</div>
              <BlmMediaPicker
                name="click"
                elementId={element!.id}
                acceptedFiles={[AcceptedFileTypes.Image]}
                data={click || out}
                placeholder="Select media"
                isLinked={!Boolean(click)}
                className="media-picker-3"
                onChange={handleChange}
              />
            </div>
            <div className="button-params-item-wrapper">
              <div className="button-params-item-title">{t("title.icon")}</div>
              <BlmMediaPicker
                name="icon"
                elementId={element!.id}
                acceptedFiles={[AcceptedFileTypes.Image]}
                data={icon}
                placeholder="Select media"
                className="media-picker-3"
                onChange={handleChange}
              />
            </div>
          </div>
          {out && (
            <>
              <Select
                name="option"
                value={option}
                MenuProps={{
                  className: "button-params-option-dropdown-menu",
                  disableRestoreFocus: true, //If It is false, BlmBackgroundEditor is not positioned to anchor element after choosing the item
                }}
                className="button-params-option-dropdown"
                onChange={handleChange}
              >
                <MenuItem value={ImageDisplayTypes.Cover}>
                  <ListItemIcon>
                    <CoverOptionIcon />
                  </ListItemIcon>
                  <ListItemText>{t("list.cover")}</ListItemText>
                </MenuItem>
                <MenuItem value={ImageDisplayTypes.Contain}>
                  <ListItemIcon>
                    <ContainOptionIcon />
                  </ListItemIcon>
                  <ListItemText>{t("list.contain")}</ListItemText>
                </MenuItem>
                <MenuItem value={ImageDisplayTypes.NoResize}>
                  <ListItemIcon>
                    <NoResizeOptionIcon />
                  </ListItemIcon>
                  <ListItemText>{t("list.no_resize")}</ListItemText>
                </MenuItem>
              </Select>
              <BlmPosition
                name="position"
                media="media-item"
                value={position}
                onChange={handleChange}
              />
            </>
          )}
          <div className="button-params-txt-wrapper">
            <input
              type="text"
              name="label"
              placeholder={t("label.lbl")}
              value={label}
              className="button-params-lbl-txt"
              onChange={handleChange}
            />
            <input
              type="text"
              name="number"
              placeholder={t("label.number")}
              value={number}
              className="button-params-num-txt"
              onChange={handleChange}
            />
            <input
              type="text"
              name="duration"
              placeholder={t("label.duration")}
              value={duration}
              className="button-params-duration-txt"
              onChange={handleChange}
            />
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
              value={description.replace(/(<([^>]+)>)/gi, "")}
              className="button-params-desc-txt"
              onChange={handleChange}
            />
            <textarea
              name="caption"
              placeholder={t("label.action_label")}
              value={caption}
              className="button-params-caption-txt"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="button-actions-wrapper">
          <div className="button-actions-title">{t("label.action")}</div>
          <div className="button-actions-lbl">
            {t("label.on")} <span className="button-actions-bold-lbl">{t("label.click")}</span>
          </div>
          <div className="button-actions-lbl">
            {t("label.on")} <span className="button-actions-bold-lbl">{t("label.roll_over")}</span>
          </div>
          <BlmActions name="clickAction" data={clickAction} onChange={handleChange} temp={temp} />
          <BlmSwitchActions
            left={clickAction}
            right={overAction}
            rightType="over"
            onClick={handleSwitchClick}
          />
          <BlmActions name="overAction" data={overAction} type="over" onChange={handleChange} />
        </div>
        {out && (
          <div className="button-styles-wrapper">
            <div className="button-styles-title">{t("title.style")}</div>
            <BlmStyleTintPicker
              type={buttonType}
              name="style"
              data={style}
              showBgTint={true}
              label={t("media_button.apply_button")}
              showApplyStyle={hasApplyStyle}
              onChange={handleChange}
            />
          </div>
        )}
      </div>
    </BlmMediaDashboard>
  );
}

export default BlmMediaButton;
