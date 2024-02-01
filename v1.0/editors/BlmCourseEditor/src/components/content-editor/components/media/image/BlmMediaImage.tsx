import React, { ChangeEvent, Fragment } from "react";
import {
  Checkbox,
  FormControlLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { ComponentStyle, CustomChangeEvent, MediaComponent, MediaFile, MediaImage } from "types";
import {
  AcceptedFileTypes,
  StyleListTypes,
  ImageDisplayTypes,
  Positions,
  MediaPosition,
  MediaBackgroundPosition,
} from "editor-constants";
import {
  CoverOptionIcon,
  ParallaxOptionIcon,
  ContainOptionIcon,
  NoResizeOptionIcon,
} from "assets/icons";
import { getMediaImage } from "utils";
import { BlmMediaPicker } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import { BlmStyleTintPicker } from "../../styles";
import BlmMediaDashboard from "../dashboard";
import { BlmPosition } from "shared";
import "./styles.scss";

export interface CompProps {
  label: string;
  data: MediaComponent;
}

function BlmMediaImage(props: CompProps) {
  const { data } = props;
  const state = getMediaImage(data);
  const { element, dispatch } = useContentEditorCtx();
  const { value: image, hasApplyStyle } = state;
  const { media, title, description, caption, option, isZoom, style, position } = image;
  const { t } = useTranslation("content-editor");

  const updateChange = (newImage: MediaImage) => {
    const newData = { ...state, value: newImage };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const handleChange = (
    event:
      | ChangeEvent<any>
      | CustomChangeEvent<
          | MediaFile
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
      checked,
    }: {
      name: string;
      value: any;
      checked: boolean;
    } = event.target;
    const newImage = { ...image };

    if (
      name === "media" ||
      name === "title" ||
      name === "description" ||
      name === "caption" ||
      name === "option" ||
      name === "style"
    ) {
      newImage[name] = value;
    } else if (name === "zoom") {
      newImage.isZoom = checked;
    } else if (name === "position") {
      newImage[name] = value;
    }

    if (newImage.media === undefined) {
      newImage.style.bgTint = undefined;
      newImage.style.tint = undefined;
    }

    updateChange(newImage);
  };

  return (
    <BlmMediaDashboard data={state}>
      <div className="content-media-image-wrapper">
        <div className="image-params-wrapper">
          <div className="image-params-title">{t("title.parameters")}</div>
          <div className="image-params-left-box">
            <BlmMediaPicker
              name="media"
              elementId={element!.id}
              acceptedFiles={[AcceptedFileTypes.Image]}
              data={media}
              placeholder="Select media"
              className="media-picker-3"
              onChange={handleChange}
            />
            {media && (
              <Fragment>
                <Select
                  name="option"
                  value={option}
                  MenuProps={{
                    className: "image-params-dropdown-menu",
                    disableRestoreFocus: true, //If It is false, BlmBackgroundEditor is not positioned to anchor element after choosing the item
                  }}
                  className="image-params-dropdown"
                  onChange={handleChange}
                >
                  <MenuItem value={ImageDisplayTypes.Cover}>
                    <ListItemIcon>
                      <CoverOptionIcon />
                    </ListItemIcon>
                    <ListItemText>{t("list.cover")}</ListItemText>
                  </MenuItem>
                  <MenuItem value={ImageDisplayTypes.Parallax}>
                    <ListItemIcon>
                      <ParallaxOptionIcon />
                    </ListItemIcon>
                    <ListItemText>{t("list.parallax")}</ListItemText>
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
                <FormControlLabel
                  name="zoom"
                  control={<Checkbox className="switch-2" />}
                  checked={isZoom}
                  label={t("image.zoom_on_click")}
                  className="image-params-zoom-ctrl"
                  onChange={handleChange}
                />
              </Fragment>
            )}
          </div>
          <div className="image-params-right-box">
            <input
              type="text"
              name="title"
              placeholder={t("label.title")}
              value={title}
              className="image-params-title-txt"
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder={t("label.description")}
              value={description.replace(/(<([^>]+)>)/gi, "")}
              className="image-params-desc-txt"
              onChange={handleChange}
            />
            <textarea
              name="caption"
              placeholder={t("label.caption")}
              value={caption}
              className="image-params-caption-txt"
              onChange={handleChange}
            />
          </div>
        </div>
        {media && (
          <div className="image-styles-wrapper">
            <div className="image-styles-title">{t("title.style")}</div>
            <BlmStyleTintPicker
              type={StyleListTypes.MediaImage}
              name="style"
              data={style}
              showBgTint={true}
              label={t("image.apply_image")}
              showApplyStyle={hasApplyStyle}
              onChange={handleChange}
            />
          </div>
        )}
      </div>
    </BlmMediaDashboard>
  );
}

export default BlmMediaImage;
