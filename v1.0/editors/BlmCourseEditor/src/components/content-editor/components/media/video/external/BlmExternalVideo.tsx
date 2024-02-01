import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ComponentStyle, CustomChangeEvent, ExternalVideo, MediaComponent, MediaFile } from "types";
import { isVimeo, isYoutube } from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  data: MediaComponent & { value: ExternalVideo };
}

function BlmExternalVideo(props: CompProps) {
  const { data, videos, getVimeoVideo } = props;
  const { value: external } = data;
  const { dispatch } = useContentEditorCtx();
  const { id, url, server, thumbnail } = external;
  const [validate, setValidate] = useState(false);
  const { t } = useTranslation("content-editor");

  useEffect(() => {
    if (validate) {
      const timerId = setTimeout(validateURL, 2000);

      return () => {
        clearTimeout(timerId);
      };
    }
  });

  useEffect(() => {
    if (id && server === "vimeo" && !thumbnail && videos[id]?.thumbnail_medium) {
      updateChange({
        ...external,
        thumbnail: videos[id]?.thumbnail_medium,
      });
    }
  });

  const updateChange = (newExternal: ExternalVideo) => {
    const newData = { ...data, value: newExternal };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const validateURL = () => {
    if (!validate) {
      return;
    }

    let newId: string | false;

    if ((newId = isYoutube(url)) && id !== newId) {
      updateChange({
        ...external,
        id: newId,
        server: "youtube",
        thumbnail: `https://img.youtube.com/vi/${newId}/mqdefault.jpg`,
      });
    } else if ((newId = isVimeo(url)) && id !== newId) {
      const thumbUrl = videos[newId]?.thumbnail_medium;

      if (!thumbUrl) {
        getVimeoVideo(newId);
      }

      updateChange({
        ...external,
        id: newId,
        server: "vimeo",
        thumbnail: thumbUrl,
      });
    } else {
      updateChange({
        ...external,
        id: undefined,
        server: undefined,
        thumbnail: undefined,
      });
    }

    setValidate(false);
  };

  const handleChange = (
    event: ChangeEvent<any> | CustomChangeEvent<MediaFile | ComponentStyle | undefined>
  ) => {
    const {
      name,
      value,
    }: {
      name: string;
      value: any;
    } = event.target;
    const newExternal = { ...external };

    if (name === "url") {
      newExternal[name] = value;
    }

    updateChange(newExternal);
    setValidate(true);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.keyCode === 13) {
      validateURL();
    }
  };

  const handleBlur = () => {
    validateURL();
  };

  return (
    <div className="external-video-wrapper">
      <div className="external-viedo-lbl">{t("external_video.video_address")}</div>
      <input
        type="text"
        name="url"
        placeholder="http://"
        value={url}
        className="external-video-url-txt"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <div className="external-video-img-wrapper">
        {thumbnail && <img src={thumbnail} alt="video thumbnail" />}
      </div>
    </div>
  );
}

export default BlmExternalVideo;
