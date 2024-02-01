import React, { ChangeEvent, useState } from "react";
import {
  FormControlLabel,
  Switch,
  Checkbox,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { ComponentStyle, CustomChangeEvent, MediaComponent, MediaFile, StandardVideo } from "types";
import { AcceptedFileTypes, ImageDisplayTypes, MediaTypes, StyleListTypes } from "editor-constants";
import { ContainOptionIcon, CoverOptionIcon } from "assets/icons";
import { BlmToggleButton } from "shared";
import { BlmMediaPicker, BlmMediaEditor } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import { BlmStyleTintPicker } from "../../../styles";
import "./styles.scss";

export interface CompProps {
  data: MediaComponent & { value: StandardVideo };
}

function BlmStandardVideo(props: CompProps) {
  const { data } = props;
  const { value: standard, hasApplyStyle } = data;
  const { element, dispatch } = useContentEditorCtx();
  const [type, setType] = useState(MediaTypes.Main);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const {
    main,
    webm,
    image,
    title,
    description,
    caption,
    autoPlay,
    loop,
    option,
    [type]: media,
    style,
  } = standard;
  const hasMain = Boolean(main);
  const { t } = useTranslation("content-editor");

  const updateChange = (newStandard: StandardVideo) => {
    const newData = { ...data, value: newStandard };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const handleTypeChange = (event: CustomChangeEvent<boolean>) => {
    const target = event.target;
    const { name } = target;

    setType(name as MediaTypes);
  };

  const handleChange = (
    event: ChangeEvent<any> | CustomChangeEvent<MediaFile | ComponentStyle | undefined>
  ) => {
    const {
      name,
      value,
      checked,
    }: {
      name: string;
      value: any;
      checked: boolean;
    } = event.target;
    const newStandard = { ...standard };
    if (name === "main") {
      if (value && !value.subtitle) {
        value.subtitle = newStandard.main?.subtitle;
      }
      if (value && !value.marker) {
        value.marker = newStandard.main?.marker;
      }

      newStandard[name] = value;
    } else if (
      name === "webm" ||
      name === "image" ||
      name === "title" ||
      name === "description" ||
      name === "caption" ||
      name === "option" ||
      name === "style"
    ) {
      newStandard[name] = value;
    } else if (name === "autoPlay") {
      newStandard[name] = !checked;
    } else if (name === "loop") {
      newStandard[name] = checked;
    }

    updateChange(newStandard);
  };

  const handleEditClick = () => {
    setIsEditorOpen(true);
  };

  const handleEditorSave = (newMain: MediaFile) => {
    const newStandard = { ...standard, main: newMain };

    updateChange(newStandard);

    setIsEditorOpen(false);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
  };

  const getAcceptedTypes = () => {
    if (type === MediaTypes.Webm) {
      return [AcceptedFileTypes.Webm];
    } else if (type === MediaTypes.Image) {
      return [AcceptedFileTypes.Image];
    } else {
      return [AcceptedFileTypes.Video];
    }
  };

  return (
    <div className="standard-video-wrapper">
      <div className="standard-video-options-wrapper">
        <span className="standard-video-autoplay-lbl">{t("label.auto_start")}</span>
        <FormControlLabel
          name="autoPlay"
          label={t("standar_video.click_to_play")}
          checked={!autoPlay}
          control={<Switch className="switch-1" />}
          className="standard-video-autoplay-ctrl"
          onChange={handleChange}
        />
        <FormControlLabel
          name="loop"
          label={t("standar_video.loop")}
          checked={loop}
          control={<Checkbox className="checkbox-2" />}
          className="standard-video-loop-ctrl"
          onChange={handleChange}
        />
      </div>
      <div className="standard-video-main-wrapper">
        <BlmMediaPicker
          name={type}
          elementId={element!.id}
          acceptedFiles={getAcceptedTypes()}
          data={media}
          showEdit={false}
          className="media-picker-3"
          onChange={handleChange}
        />
        <div className="standard-video-btns-wrapper">
          <BlmToggleButton
            name={MediaTypes.Main}
            selected={type === MediaTypes.Main}
            className={clsx("mp4-toggle-btn", { media: hasMain })}
            onChange={handleTypeChange}
          >
            {t("standar_video.mp4")}
          </BlmToggleButton>
          <BlmToggleButton
            name={MediaTypes.Webm}
            disabled={!hasMain}
            selected={type === MediaTypes.Webm}
            className={clsx("webm-toggle-btn", { media: Boolean(webm) })}
            onChange={handleTypeChange}
          >
            {t("standar_video.webm")}
          </BlmToggleButton>
          <BlmToggleButton
            name={MediaTypes.Image}
            disabled={!hasMain}
            selected={type === MediaTypes.Image}
            className={clsx("img-toggle-btn", { media: Boolean(image) })}
            onChange={handleTypeChange}
          >
            {t("button.thumbnail")}
          </BlmToggleButton>
        </div>
        {hasMain && (
          <Select
            name="option"
            value={option}
            MenuProps={{
              className: "standard-video-dropdown-menu",
              disableRestoreFocus: true, //If It is false, BlmBackgroundEditor is not positioned to anchor element after choosing the item
            }}
            className="standard-video-dropdown"
            onChange={handleChange}
          >
            <MenuItem value={ImageDisplayTypes.Contain}>
              <ListItemIcon>
                <ContainOptionIcon />
              </ListItemIcon>
              <ListItemText>{t("list.contain")}</ListItemText>
            </MenuItem>
            <MenuItem value={ImageDisplayTypes.Cover}>
              <ListItemIcon>
                <CoverOptionIcon />
              </ListItemIcon>
              <ListItemText>{t("list.cover")}</ListItemText>
            </MenuItem>
          </Select>
        )}
        <input
          type="text"
          name="title"
          placeholder={t("label.title")}
          value={title}
          className="standard-video-title-txt"
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder={t("label.description")}
          value={description.replace(/(<([^>]+)>)/gi, "")}
          className="standard-video-desc-txt"
          onChange={handleChange}
        />
        <textarea
          name="caption"
          placeholder={t("label.caption")}
          value={caption}
          className="standard-video-caption-txt"
          onChange={handleChange}
        />
      </div>
      <div className="standard-video-markers-title">{t("subtitle_marker.sub_marker")}</div>
      <div
        className={clsx("standard-video-edit-btn", { disabled: !hasMain })}
        onClick={handleEditClick}
      >
        {t("button.edit")}
      </div>
      {isEditorOpen && main && (
        <BlmMediaEditor
          open={isEditorOpen}
          elementId={element!.id}
          data={main}
          onSave={handleEditorSave}
          onClose={handleEditorClose}
        />
      )}
      {media && (
        <div className="video-styles-wrapper">
          <div className="video-styles-title">{t("title.style")}</div>
          <BlmStyleTintPicker
            type={StyleListTypes.MediaVideo}
            name="style"
            data={style}
            showBgTint={true}
            label={t("video.apply_image")}
            showApplyStyle={hasApplyStyle}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
}

export default BlmStandardVideo;
