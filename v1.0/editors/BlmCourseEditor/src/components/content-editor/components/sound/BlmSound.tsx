import React, { ChangeEvent, Fragment, useState } from "react";
import clsx from "clsx";
import { FormControlLabel, Switch } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { ComponentStyle, CustomChangeEvent, MediaFile, SoundComponent, SoundValue } from "types";
import { StyleListTypes, AcceptedFileTypes, MediaTypes, ElementType } from "editor-constants";
import { BlmToggleButton } from "shared";
import { BlmMediaPicker, BlmMediaEditor } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateSoundComponent } from "components/content-editor/reducers";
import { BlmStyleTintPicker } from "../styles";
import "./styles.scss";

export interface CompProps {
  data: SoundComponent;
}

function BlmSound(props: CompProps) {
  const { data } = props;
  const { element, dispatch } = useContentEditorCtx();
  const [type, setType] = useState(MediaTypes.Main);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { value: sound, hasApplyStyle } = data;
  const { media, image, autoPlay, localPlay, title, description, caption, style } = sound;
  const hasMedia = Boolean(media);
  const [name, types, main] =
    type === MediaTypes.Image
      ? ["image", [AcceptedFileTypes.Image], image]
      : ["media", [AcceptedFileTypes.Audio], media];

  const updateChange = (newSound: SoundValue) => {
    const newData = { ...data, value: newSound };

    if (dispatch) {
      dispatch(updateSoundComponent(newData));
    }
  };
  const { t } = useTranslation("content-editor");

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
    const newSound = { ...sound };

    if (
      name === "media" ||
      name === "image" ||
      name === "title" ||
      name === "description" ||
      name === "caption" ||
      name === "style"
    ) {
      newSound[name] = value;
    } else if (name === "autoPlay" || name === "localPlay") {
      newSound[name] = !checked;
    }

    updateChange(newSound);
  };

  const handleEditClick = () => {
    setIsEditorOpen(true);
  };

  const handleEditorSave = (newMedia: MediaFile) => {
    const newSound = { ...sound, media: newMedia };

    updateChange(newSound);

    setIsEditorOpen(false);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
  };
  
  return (
    <div className="content-sound-wrapper">
      <div className="sound-params-wrapper">
        <div className="sound-params-title">{t("title.parameters")}</div>
        <div className="sound-params-options-wrapper">
          <span className="sound-autoplay-lbl">{t("label.auto_start")}</span>
          <FormControlLabel
            name="autoPlay"
            label={t("style.click_play")}
            checked={!autoPlay}
            control={<Switch className="switch-1" />}
            className="sound-autoplay-ctrl"
            onChange={handleChange}
          />
        </div>
        <div className="sound-params-main-wrapper">
          <div className="sound-params-media-wrapper">
            <BlmMediaPicker
              name={name}
              elementId={element!.id}
              acceptedFiles={types}
              data={main}
              showEdit={false}
              placeholder="Select media"
              className="sound-picker-3"
              onChange={handleChange}
            />
            <BlmToggleButton
              name={MediaTypes.Main}
              selected={type === MediaTypes.Main}
              className={clsx("mp3-toggle-btn", { media: hasMedia })}
              onChange={handleTypeChange}
            >
              {t("sound.mp3")}
            </BlmToggleButton>
            <BlmToggleButton
              name={MediaTypes.Image}
              disabled={!hasMedia}
              selected={type === MediaTypes.Image}
              className={clsx("img-toggle-btn", { media: Boolean(image) })}
              onChange={handleTypeChange}
            >
              {t("button.thumbnail")}
            </BlmToggleButton>
          </div>
          <input
            type="text"
            name="title"
            placeholder={t("label.title")}
            value={title}
            className="sound-params-title-txt"
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder={t("label.description")}
            value={description}
            className="sound-params-desc-txt"
            onChange={handleChange}
          />
          <textarea
            name="caption"
            placeholder={t("label.caption")}
            value={caption}
            className="sound-params-caption-txt"
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="sound-subtitle-title">{t("subtitle_marker.sub_marker")}</div>
      <div
        className={clsx("sound-subtitle-edit-btn", { disabled: !hasMedia })}
        onClick={handleEditClick}
      >
        {t("button.edit")}
      </div>
      {hasMedia && (
        <Fragment>
          <BlmMediaEditor
            open={isEditorOpen}
            data={media!}
            elementId={element!.id}
            onSave={handleEditorSave}
            onClose={handleEditorClose}
          />
          <div className="sound-styles-wrapper">
            <div className="sound-styles-title">{t("title.style")}</div>
            {!element?.name.includes("snd") &&
              (element?.type === ElementType.PartPage ||
                element?.type === ElementType.SimplePartPage) && (
                <div className="sound-styles-options-wrapper">
                  <span className="sound-localplay-lbl">
                    {t("sound.play_partpage")}
                    <br />
                    {t("sound.in_complete")}
                  </span>
                  <FormControlLabel
                    name="localPlay"
                    label={t("sound.play_globally")}
                    checked={!localPlay}
                    control={<Switch className="switch-1" />}
                    className="sound-localplay-ctrl"
                    onChange={handleChange}
                  />
                </div>
              )}
            <BlmStyleTintPicker
              type={StyleListTypes.Sound}
              name="style"
              data={style}
              showBgTint={true}
              label={t("sound.apply_style")}
              showApplyStyle={hasApplyStyle}
              onChange={handleChange}
            />
          </div>
        </Fragment>
      )}
    </div>
  );
}

export default BlmSound;
