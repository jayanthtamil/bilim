import React, { MouseEvent } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, LinkMedia, MediaFile } from "types";
import { AcceptedFileTypes, MediaOptionTypes } from "editor-constants";
import { BlmMediaPicker, MediaPickerChangeEvent } from "components/shared";
import "./styles.scss";

export type LinkMediaChangeEvent = CustomChangeEvent<LinkMedia | undefined>;

interface CompProps {
  elementId: string;
  name: string;
  data?: LinkMedia | null;
  linkMedia?: MediaFile | null;
  isEditable?: boolean;
  onChange: (event: LinkMediaChangeEvent) => void;
}

function BlmLinkMedia(props: CompProps) {
  const { elementId, name, data, linkMedia, isEditable = true, onChange } = props;
  const { option, media } = data || {};
  const showLinkBtn = isEditable && linkMedia && !media ? true : false;
  const isLinked = showLinkBtn && (!option || option === MediaOptionTypes.Linked) ? true : false;
  const { t } = useTranslation("question-editor");

  const updateChange = (newData: LinkMedia) => {
    if (onChange) {
      onChange({ target: { name, value: newData } });
    }
  };

  const getNewData = () => {
    if (data) {
      return { ...data };
    } else {
      return {
        option: isLinked ? MediaOptionTypes.Linked : MediaOptionTypes.None,
      };
    }
  };

  const handleLinkClick = (event: MouseEvent) => {
    const newData: LinkMedia = getNewData();

    if (newData.option === MediaOptionTypes.Linked) {
      newData.option = MediaOptionTypes.None;
    } else {
      newData.option = MediaOptionTypes.Linked;
    }

    updateChange(newData);
  };

  const handleChange = (event: MediaPickerChangeEvent) => {
    const { value } = event.target;
    const newData: LinkMedia = getNewData();

    newData.option = value ? MediaOptionTypes.Media : MediaOptionTypes.None;
    newData.media = value;

    updateChange(newData);
  };

  return (
    <div className="link-media-picker">
      <BlmMediaPicker
        name={name}
        elementId={elementId}
        acceptedFiles={[AcceptedFileTypes.Image, AcceptedFileTypes.Video]}
        data={isLinked ? linkMedia : media}
        placeholder={t("label.select_media")}
        isLinked={isLinked}
        replaceZone={isLinked ? "none" : "button"}
        disabled={!isEditable}
        className="media-picker-1"
        onChange={handleChange}
      />
      {showLinkBtn && (
        <div className={clsx("link-btn", { linked: isLinked })} onClick={handleLinkClick} />
      )}
    </div>
  );
}

export default BlmLinkMedia;
