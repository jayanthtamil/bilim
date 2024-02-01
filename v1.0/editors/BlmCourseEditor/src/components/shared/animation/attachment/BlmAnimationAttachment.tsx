import React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { AnimationAttachment } from "types";
import { MIMEType } from "editor-constants";
import { getFileExtension, isAudio, isImage, isVideo } from "utils";
import BlmReplaceAttachment from "../replace";
import "./styles.scss";

export interface CompProps {
  id: string;
  data: AnimationAttachment;
}

export const getFileClassName = (ext: string, type?: MIMEType) => {
  if (type) {
    if (isImage(type)) {
      return "image";
    } else if (isVideo(type)) {
      return "video";
    } else if (isAudio(type)) {
      return "audio";
    } else if (ext === "pdf") {
      return "pdf";
    } else if (ext === "json") {
      return "json";
    }
  }
  return "doc";
};

function BlmAnimationAttachment(props: CompProps) {
  const { id, data } = props;
  const { id: fid, name, type, url, subtitle } = data;
  const ext = getFileExtension(name);
  const { t } = useTranslation("shared");

  return (
    <div className={clsx("attachment-wrapper", getFileClassName(ext, type))}>
      <div className="attachment-preview">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {type && isImage(type) && <img src={`${url}?${fid}`} alt={name} />}
        </a>
      </div>
      <div className="attachment-lbl">{name}</div>
      <div className="attachment-download-btn">
        <a href={url} download>
          {t("animation_attach.download")}
        </a>
      </div>
      <BlmReplaceAttachment id={id} data={data} className="attachment-replace-btn" />
      {subtitle && (
        <div className="attachment-subs-wrapper">
          <div className="attachment-subs-title">{t("animation_attach.subtitles")}</div>
          <div className="attachment-subs-download-btn">
            <a href={subtitle.url} download>
              {t("animation_attach.download")}
            </a>
          </div>
          <BlmReplaceAttachment id={id} data={subtitle} className="attachment-subs-replace-btn" />
        </div>
      )}
    </div>
  );
}

export default BlmAnimationAttachment;
