import React, {
  ChangeEvent,
  MouseEvent,
  Fragment,
  ReactNode,
  HTMLAttributes,
  PropsWithChildren,
} from "react";
import clsx from "clsx";

import { CustomChangeEvent, DialogOptions, MediaFile } from "types";
import { AcceptedFileTypes } from "editor-constants";
import { isVideo, isAudio, isZip, isJSON } from "utils";
import { useUploadMedia } from "components/hooks";
import { ContainerProps } from "./media-picker-container";
import "./media-picker.scss";

export type MediaPickerChangeEvent = CustomChangeEvent<MediaFile | undefined>;

export interface MediaPickerProps
  extends ContainerProps,
    Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  name: string;
  elementId: string;
  acceptedFiles: AcceptedFileTypes[];
  data?: MediaFile | null;
  placeholder?: string;
  isLinked?: boolean;
  showEdit?: boolean;
  disabled?: boolean;
  replaceZone?: "button" | "display" | "none";
  previewZone?: "display" | "none";
  deleteAlert?: { title: string; message: string; options?: DialogOptions };
  onChange?: (event: MediaPickerChangeEvent) => void;
  onEdit?: (event: MouseEvent) => void;
  hotspot?: string;
  sound?: string;
  showDesign?: string;
}

function BlmMediaPicker(props: PropsWithChildren<MediaPickerProps>) {
  const {
    elementId,
    name,
    data,
    placeholder,
    acceptedFiles,
    isLinked = false,
    showEdit = false,
    disabled = false,
    className,
    replaceZone = "button",
    previewZone = "display",
    deleteAlert,
    children,
    openConfirmDialog,
    onChange,
    onEdit,
    hotspot,
    sound,
    showDesign,
    ...others
  } = props;
  const { fileRef, browseMedia, uploadMedia, deleteMedia } = useUploadMedia({
    name,
    elementId,
    data,
    isLinked,
    onChange,
  });
  const accepted = acceptedFiles.join(",");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    uploadMedia(event.target.files);
  };

  const handleDelete = (event: MouseEvent<HTMLElement>) => {
    if (deleteAlert) {
      openConfirmDialog(
        deleteAlert.title,
        deleteAlert.message,
        deleteMedia,
        undefined,
        deleteAlert.options
      );
    } else {
      deleteMedia();
    }
  };

  const getPickerClassName = () => {
    if (acceptedFiles.indexOf(AcceptedFileTypes.Audio) !== -1) {
      return "audio";
    } else if (acceptedFiles.indexOf(AcceptedFileTypes.Video) !== -1) {
      return "video";
    } else if (acceptedFiles.indexOf(AcceptedFileTypes.Zip) !== -1) {
      return "zip";
    } else {
      return "image";
    }
  };

  const getPreviewClassName = () => {
    if (!data) {
      return undefined;
    } else if (isVideo(data.type)) {
      return "video";
    } else if (isAudio(data.type)) {
      return "audio";
    } else if (isZip(data.type)) {
      return "zip";
    } else if (isJSON(data.type)) {
      return "json";
    } else {
      return "image";
    }
  };

  const renderLink = (isLink: boolean, children?: ReactNode) => {
    if (data && isLink) {
      return (
        <a href={data.url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return children;
  };

  const renderValue = () => {
    if (data) {
      window.open(data.url);
    }
  };

  const renderDisplay = () => {
    if (!data) {
      return null;
    } else if (children) {
      return children;
    } else if (isVideo(data.type)) {
      return (
        <Fragment>
          <video src={data.url} height="102px" width="122px" />
          <div className="video-icon" />
        </Fragment>
      );
    } else if (isAudio(data.type)) {
      return (
        <Fragment>
          <audio src={data.url} />
          <div className="audio-icon" />
        </Fragment>
      );
    } else if (isZip(data.type)) {
      return <div className="zip-icon" />;
    } else if (isJSON(data.type)) {
      return <div className="json-icon" />;
    } else {
      return <img src={data.url} alt={data.name} />;
    }
  };

  return (
    <div
      className={clsx(
        "media-picker-wrapper",
        getPickerClassName(),
        {
          disabled: disabled,
          "has-media": data,
          linked: isLinked,
        },
        className
      )}
      {...others}
    >
      <div className="media-browse-wrapper" onClick={browseMedia}>
        <input
          ref={fileRef}
          type="file"
          accept={accepted}
          onChange={handleFileChange}
          className="input-file"
        />
        <div className="browse-placeholder">{placeholder}</div>
      </div>
      {data && (
        <div
          className={clsx(
            "media-preview-wrapper",
            "replace-zone-" + replaceZone,
            getPreviewClassName()
          )}
        >
          <div
            className="media-display-wrapper"
            onClick={hotspot !== "hotspot" ? browseMedia : undefined}
          >
            {renderLink(
              previewZone === "display" && replaceZone !== "display" && hotspot === "hotspot",
              renderDisplay()
            )}
          </div>
          {showEdit && <div className="media-edit-btn" onClick={onEdit} />}
          <div className="media-delete-btn" onClick={handleDelete} />
          {hotspot === "hotspot" && <div className="media-replace-btn" onClick={browseMedia} />}
          {replaceZone === "button" && (
            <div
              className={
                showDesign === "showDesign"
                  ? "media-preview-btn media-preview-proposition-btn"
                  : sound === "sound"
                  ? "media-preview-btn media-preview-sound-btn"
                  : hotspot === "hotspot"
                  ? "media-preview-btn media-preview-radius-btn"
                  : "media-preview-btn"
              }
              onClick={() => renderValue()}
            />
          )}
          <div className="media-name">{data.name}</div>
        </div>
      )}
    </div>
  );
}

export default BlmMediaPicker;
