import React, { ChangeEvent } from "react";
import clsx from "clsx";
import { ListItemIcon, ListItemText, MenuItem, Select } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { ComponentStyle, CustomChangeEvent, MediaFile, ComponentAction, FlipCardSide } from "types";
import {
  StyleListTypes,
  AcceptedFileTypes,
  ImageDisplayTypes,
  MediaPosition,
  Positions,
  MediaBackgroundPosition,
} from "editor-constants";
import { CoverOptionIcon, ContainOptionIcon, NoResizeOptionIcon } from "assets/icons";
import { BlmMediaPicker } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import { BlmStyleTintPicker } from "../../../styles";
import { BlmPosition } from "shared";
import "./styles.scss";

export type FlipCardSideChangeEvent = CustomChangeEvent<FlipCardSide>;

export interface CompProps {
  name: string;
  data: FlipCardSide;
  type?: "recto" | "verso";
  onChange?: (event: FlipCardSideChangeEvent) => void;
}

const NUMBER_REG = /^$|^[\d\b]+$/;

function BlmFlipCardSide(props: CompProps) {
  const { name, data, type = "recto", onChange } = props;
  const { element } = useContentEditorCtx();
  const {
    media,
    icon,
    title,
    description,
    caption,
    label,
    number,
    duration,
    option,
    style,
    position,
  } = data;
  const isRecto = type === "recto";
  const { t } = useTranslation("content-editor");

  const updateChange = (value: FlipCardSide) => {
    if (onChange) {
      onChange({ target: { name, value } });
    }
  };

  const handleChange = (
    event:
      | ChangeEvent<any>
      | CustomChangeEvent<
          | MediaFile
          | ComponentAction
          | ComponentStyle
          | MediaPosition
          | Positions
          | MediaBackgroundPosition
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
    const newData = { ...data };

    if (
      name === "media" ||
      name === "icon" ||
      name === "title" ||
      name === "description" ||
      name === "caption" ||
      name === "label" ||
      (name === "number" && NUMBER_REG.test(value)) ||
      name === "duration" ||
      name === "option" ||
      name === "style"
    ) {
      newData[name] = value;
    } else if (name === "position") {
      newData[name] = value;
    }

    updateChange(newData);
  };

  return (
    <div className={clsx("flipcard-side-wrapper", type)}>
      <div className="flipcard-title">
        {isRecto ? `${t("flipkart.recto")}` : `${t("flipkart.verso")}`}
      </div>
      <div className="flipcard-media-wrapper">
        <BlmMediaPicker
          name="media"
          elementId={element!.id}
          acceptedFiles={[AcceptedFileTypes.Image]}
          data={media}
          placeholder="Select media"
          className="media-picker-3 flipcard-media"
          onChange={handleChange}
        />
        <div className="flipcard-icon-title">{t("title.icon")}</div>
        <BlmMediaPicker
          name="icon"
          elementId={element!.id}
          acceptedFiles={[AcceptedFileTypes.Image]}
          data={icon}
          placeholder="Select media"
          className="media-picker-3 flipcard-icon"
          onChange={handleChange}
        />
        <Select
          name="option"
          value={option}
          MenuProps={{
            className: "flipcard-option-dropdown-menu",
            disableRestoreFocus: true, //If It is false, BlmBackgroundEditor is not positioned to anchor element after choosing the item
          }}
          className="flipcard-option-dropdown"
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
        <BlmPosition name="position" media="media-item" value={position} onChange={handleChange} />
      </div>
      <div className="flipcard-txt-wrapper">
        <input
          type="text"
          name="label"
          placeholder={t("label.lbl")}
          value={label}
          className="flipcard-lbl-txt"
          onChange={handleChange}
        />
        <input
          type="text"
          name="number"
          placeholder={t("label.number")}
          value={number}
          className="flipcard-num-txt"
          onChange={handleChange}
        />
        <input
          type="text"
          name="duration"
          placeholder={t("label.duration")}
          value={duration}
          className="flipcard-duration-txt"
          onChange={handleChange}
        />
        <input
          type="text"
          name="title"
          placeholder={t("label.title")}
          value={title}
          className="flipcard-title-txt"
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder={t("label.description")}
          value={description.replace(/(<([^>]+)>)/gi, "")}
          className="flipcard-desc-txt"
          onChange={handleChange}
        />
        <textarea
          name="caption"
          placeholder={isRecto ? `${t("label.caption")}` : `${t("label.action_label")}`}
          value={caption}
          className="flipcard-caption-txt"
          onChange={handleChange}
        />
      </div>
      <div className="flipcard-styles-wrapper">
        <div className="flipcard-styles-title">{t("title.style")}</div>
        <BlmStyleTintPicker
          type={isRecto ? StyleListTypes.MediaFlipCardRecto : StyleListTypes.MediaFlipCardVerso}
          name="style"
          data={style}
          tintTitle={t("style.background_tint")}
          tintBgTitle={t("style.secondary_tint")}
          showBgTint={true}
          showApplyStyle={false}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default BlmFlipCardSide;
