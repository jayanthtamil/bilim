import React, { ChangeEvent, Fragment, useState } from "react";
import clsx from "clsx";
import {
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CoverOptionIcon, ContainOptionIcon, NoResizeOptionIcon } from "assets/icons";
import { BackgroundMedia, CustomChangeEvent, MediaFile, Tint } from "types";
import {
  AcceptedFileTypes,
  BackgroundOptionTypes,
  MediaTypes,
  ImageDisplayTypes,
  Positions,
  MediaBackgroundPosition,
  MediaPosition,
} from "editor-constants";
import { isVideo, isImage } from "utils";
import { BlmToggleButton, BlmSubscriptInput, BlmTintPicker } from "shared";
import BlmMediaPicker from "../media-picker";
import { createItems, getDefaultOption, getOptions, getOptions2 } from "./utils";
import { ContainerProps } from "./container";
import { BlmPosition } from "shared";
import "./styles.scss";

export type BGMediaDisplayTypes = "page" | "page-action" | "screen" | "partpage";
export type BackgroundMediaChangeEvent = CustomChangeEvent<BackgroundMedia>;

export interface CompProps extends ContainerProps {
  name: string;
  elementId: string;
  type: BGMediaDisplayTypes;
  data: BackgroundMedia;
  onChange: (event: BackgroundMediaChangeEvent) => void;
}

function BlmBackgroundMedia(props: CompProps) {
  const { name, elementId, type, data, bgColors, onChange } = props;
    const { main, webm, image, option, optionValue, option2, option3, restore, tint, position } =
    data;
  const [mediaType, setMediaType] = useState(MediaTypes.Main);
  const hasMedia = Boolean(main);
  const hasVideo = main ? isVideo(main.type) : false;
  const isMedia = main ? isImage(main.type) : false;
  const showOptions = hasMedia ;
  const showOptions3 = hasMedia && (type === "partpage" || type === "screen");
  const showOptions2 = !hasVideo && (type === "page" || type === "page-action");
  const currentMedia = data[mediaType];
  const options = getOptions(type, hasVideo);
  const currentOption = getDefaultOption(options, option);
  const options2 = getOptions2(currentOption);
  const currentOption2 = getDefaultOption(options2, option2);
  const { t } = useTranslation("shared");
  
  const updateChange = (newData: BackgroundMedia) => {
    if (onChange) {
      onChange({ target: { name, value: newData } });
    }
  };

  const handleTypeChange = (event: CustomChangeEvent<boolean>) => {
    const target = event.target;
    const { name } = target;

    setMediaType(name as MediaTypes);
  };

  const handleChange = (
    event:
      | ChangeEvent<any>
      | CustomChangeEvent<
          | MediaFile
          | Tint
          | number
          | undefined
          | MediaBackgroundPosition
          | MediaPosition
          | Positions
        >
  ) => {
    const { target } = event;
    const name = target.name as string;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData: BackgroundMedia = { ...data };

    if (name === mediaType) {
      const newMedia = value as MediaFile;

      newData[name as MediaTypes] = newMedia;

      if (name === MediaTypes.Main) {
        newData.option = getDefaultOption(options, newData.option);
        newData.option2 = getDefaultOption(getOptions2(newData.option), newData.option2);
      }
    } else if (name === "tint") {
      newData.tint = value as Tint;
    } else if (
      name === "option" ||
      name === "option2" ||
      name === "option3" ||
      name === "restore"
    ) {
      (newData[name] as any) = value;

      if (name === "option") {
        newData.option2 = getDefaultOption(getOptions2(newData.option), newData.option2);
      }
    } else if (name === "parallax" || name === "loop") {
      newData.optionValue = value;
      if (name === "loop") {
        newData.option = getDefaultOption(options, newData.option);
      }
    } else if (name === "position") {
      newData[name] = value;
    }
    updateChange(newData);
  };

  const getAcceptedTypes = () => {
    if (mediaType === MediaTypes.Image) {
      return [AcceptedFileTypes.Image];
    } else if (mediaType === MediaTypes.Webm) {
      return [AcceptedFileTypes.Webm];
    } else {
      return [AcceptedFileTypes.Image, AcceptedFileTypes.Video];
    }
  };

  return (
    <div
      className={clsx("background-media-wrapper", type, {
        "has-media": hasMedia,
        "has-video": hasVideo,
      })}
    >
      <span className="background-media-title">{currentMedia ? currentMedia.name : "Media"}</span>
      <BlmMediaPicker
        name={mediaType}
        elementId={elementId}
        acceptedFiles={getAcceptedTypes()}
        data={currentMedia}
        onChange={handleChange}
      />
      <BlmTintPicker
        title={t("label.tint")}
        data={tint}
        colors={bgColors}
        onChange={handleChange}
      />
      {hasVideo && (
        <div className="background-video-btns-wrapper">
          <BlmToggleButton
            name={MediaTypes.Main}
            selected={hasMedia}
            className="mp4-toggle-btn"
            onChange={handleTypeChange}
          />
          <BlmToggleButton
            name={MediaTypes.Webm}
            selected={Boolean(webm)}
            className="webm-toggle-btn"
            onChange={handleTypeChange}
          />
          <BlmToggleButton
            name={MediaTypes.Image}
            selected={Boolean(image)}
            className="img-toggle-btn"
            onChange={handleTypeChange}
          />
          {currentOption === BackgroundOptionTypes.Autoplay && (
            <FormControlLabel
              name="loop"
              label={t("background_media.loop")}
              control={<Checkbox className="checkbox-2" />}
              checked={Boolean(optionValue)}
              className="background-video-loop-ctrl"
              onChange={handleChange}
            />
          )}
        </div>
      )}
      {showOptions && (
        <Fragment>
          <div className="background-dropdown-wrapper">
            <Select
              name="option"
              value={currentOption}
              className="bg-option-dropdown"
              MenuProps={{
                className: "bg-option-dropdown-menu",
                disableRestoreFocus: true, //If It is false, BlmBackgroundEditor is not positioned to anchor element after choosing the item
              }}
              onChange={handleChange}
            >
              {createItems(options, !hasVideo)}
            </Select>
            {currentOption === BackgroundOptionTypes.Parallax && (
              <BlmSubscriptInput
                name="parallax"
                label="px"
                min={0}
                max={1000}
                value={Number(optionValue)}
                onChange={handleChange}
              />
            )}
          </div>

          {showOptions3 && (
            <div className="background-options">
              {isMedia && (
                <Fragment>
                  <Select
                    name="option3"
                    value={option3}
                    MenuProps={{
                      className: "background-image-params-dropdown-menu",
                      disableRestoreFocus: true, //If It is false, BlmBackgroundEditor is not positioned to anchor element after choosing the item
                    }}
                    className="background-image-params-dropdown"
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
                </Fragment>
              )}
              <BlmPosition
                name="position"
                media="background-media-item"
                value={position}
                onChange={handleChange}
              />
            </div>
          )}

          {showOptions2 && (
            <Select
              name="option2"
              value={currentOption2}
              className="bg-option-2-dropdown"
              MenuProps={{
                className: "bg-option-2-dropdown-menu",
                disableRestoreFocus: true, //If It is false, BlmBackgroundEditor is not positioned to anchor element after choosing the item
              }}
              onChange={handleChange}
            >
              {createItems(options2, false)}
            </Select>
          )}
          {type === "page-action" && (
            <FormControlLabel
              name="restore"
              label={t("background_media.restore")}
              control={<Checkbox />}
              checked={restore}
              className="background-restore-ctrl"
              onChange={handleChange}
            />
          )}
        </Fragment>
      )}
    </div>
  );
}

export default BlmBackgroundMedia;
