import React from "react";
import { useTranslation } from "react-i18next";

import {
  BackgroundMedia,
  BackgroundProps,
  CustomChangeEvent,
  ElementPropsComponent,
  Tint,
} from "types";
import { BackgroundSizeTypes } from "editor-constants";
import { isVideo } from "utils";
import { BlmTintPicker } from "shared";
import { BlmBackgroundMedia, BlmBackgroundSize } from "components/shared";
import { ContainerProps } from "./container";
import "./page-background.scss";

export interface CompProps extends ElementPropsComponent, ContainerProps {}

const BlmPageBackgroundProps = (props: CompProps) => {
  const { data, bgColors, onChange } = props;
  const state = data.backgroundJSON!;
  const { media, tint, mediaSize, colorSize } = state;
  const { t } = useTranslation("properties");

  const updateChange = (newState: BackgroundProps) => {
    if (onChange && data) {
      const newData = { ...data, backgroundJSON: newState };

      onChange(newData);
    }
  };

  const handleChange = (event: CustomChangeEvent<BackgroundMedia | BackgroundSizeTypes | Tint>) => {
    if (data) {
      const { name, value } = event.target;
      const newState = { ...state };

      if (name === "media" || name === "tint" || name === "mediaSize" || name === "colorSize") {
        newState[name] = value as any;
      }

      updateChange(newState);
    }
  };

  if (data) {
    return (
      <div className="page-background-props-container">
        <div className="page-bg-props-bg-media-title">
          {media.main?.type && isVideo(media.main?.type) ? "Background Video" : "Background Media"}
        </div>
        <BlmBackgroundMedia
          name="media"
          elementId={data.id}
          type="page"
          data={media}
          onChange={handleChange}
        />
        <BlmBackgroundSize
          title={t("page_screen_background.size")}
          name="mediaSize"
          size={mediaSize}
          disabled={!Boolean(media.main)}
          className="page-bg-props-media-size-box"
          onChange={handleChange}
        />
        <div className="page-bg-props-bg-color-title">
          {t("page_screen_background.background_clr")}
        </div>
        <BlmTintPicker data={tint} colors={bgColors} onChange={handleChange} />
        <BlmBackgroundSize
          name="colorSize"
          size={colorSize}
          disabled={!Boolean(tint.color)}
          className="page-bg-props-color-size-box"
          onChange={handleChange}
        />
      </div>
    );
  } else {
    return null;
  }
};

export default BlmPageBackgroundProps;
