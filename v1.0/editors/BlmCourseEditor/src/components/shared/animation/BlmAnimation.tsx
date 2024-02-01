import React, { Fragment, useEffect, useState } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { AnimationMedia, AnimationOptions, AnimationTranslation, MediaFile } from "types";
import { AcceptedFileTypes } from "editor-constants";
import { BlmMediaPicker, MediaPickerChangeEvent } from "components/shared";
import BlmTranslationEditor from "./tranaslation";
import BlmOptionsEditor from "./options";
import BlmAnimationAttachment from "./attachment";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  elementId: string;
  data?: MediaFile | null;
  onChange: (event: MediaPickerChangeEvent) => void;
}

function BlmAnimation(props: CompProps) {
  const { elementId, data, animations, getAnimation, updateAnimation, onChange } = props;
  const [currentAnimation, setCurrentAnimation] = useState<AnimationMedia>();
  const [isTranslationOpen, setIsTranslationOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { translations, options, attachments } = currentAnimation || {};
  const mediaId = data?.id;
  const { t } = useTranslation("shared");

  useEffect(() => {
    if (mediaId) {
      if (animations[mediaId]) {
        setCurrentAnimation(animations[mediaId]);
      } else {
        getAnimation(mediaId);
      }
    } else {
      setCurrentAnimation(undefined);
    }
  }, [mediaId, animations, getAnimation]);

  const handlePreviewClick = () => {
    if (data) {
      window.open(data.url + "/" + data.rootFile, "_blank");
    }
  };

  const handleTranslateClick = () => {
    setIsTranslationOpen(true);
  };

  const handleTranslationSave = (newTranslations: AnimationTranslation[]) => {
    if (mediaId && newTranslations) {
      updateAnimation(mediaId, { translations: newTranslations });
    }
  };

  const handleTranslationClose = () => {
    setIsTranslationOpen(false);
  };

  const handleOptionsClick = () => {
    setIsOptionsOpen(true);
  };

  const handleOptionsSave = (newOptions: AnimationOptions) => {
    if (mediaId && newOptions) {
      updateAnimation(mediaId, { options: newOptions });
    }
  };

  const handleOptionsClose = () => {
    setIsOptionsOpen(false);
  };

  return (
    <div className="animation-wrapper">
      <BlmMediaPicker
        name="media"
        elementId={elementId}
        acceptedFiles={[AcceptedFileTypes.Zip]}
        data={data}
        replaceZone="display"
        className="zip-picker-1 animation-media-picker"
        onChange={onChange}
      />
      {data && (
        <Fragment>
          <div className="animation-preview-btn" onClick={handlePreviewClick}>
            {t("animation.preview")}
          </div>
          <div
            className={clsx("animation-translate-btn", {
              disabled: !translations || translations.length === 0,
            })}
            onClick={handleTranslateClick}
          >
            {t("animation.translate")}
          </div>
          <div
            className={clsx("animation-options-btn", {
              disabled: !options,
            })}
            onClick={handleOptionsClick}
          >
            {t("animation.option")}
          </div>
        </Fragment>
      )}
      {attachments && (
        <div className="animation-attachments-wrapper">
          <div className="animation-attachments-title">{t("animation.attached_media")}</div>
          <div className="animation-attachments-lbl">{t("animation.click_to_replace")}</div>
          {attachments.map((attachment, ind) => (
            <BlmAnimationAttachment key={ind} id={mediaId!} data={attachment} />
          ))}
        </div>
      )}
      {translations && isTranslationOpen && (
        <BlmTranslationEditor
          open={isTranslationOpen}
          data={translations}
          onSave={handleTranslationSave}
          onClose={handleTranslationClose}
        />
      )}
      {options && isOptionsOpen && (
        <BlmOptionsEditor
          open={isOptionsOpen}
          data={options}
          onSave={handleOptionsSave}
          onClose={handleOptionsClose}
        />
      )}
    </div>
  );
}

export default BlmAnimation;
