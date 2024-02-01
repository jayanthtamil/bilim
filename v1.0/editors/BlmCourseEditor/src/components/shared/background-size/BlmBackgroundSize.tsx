import React, { MouseEvent } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent } from "types";
import { BackgroundSizeTypes } from "editor-constants";
import "./styles.scss";

export type BackgroundSizeChangeEvent = CustomChangeEvent<BackgroundSizeTypes>;

export interface CompProps {
  name: string;
  size: BackgroundSizeTypes;
  disabled: boolean;
  title?: string;
  className?: string;
  onChange: (event: BackgroundSizeChangeEvent) => void;
}

function BlmBackgroundSize(props: CompProps) {
  const { title, name, size, disabled, className, onChange } = props;
  const { t } = useTranslation("shared");

  const updateChange = (newSize: BackgroundSizeTypes) => {
    if (onChange) {
      onChange({ target: { name, value: newSize } });
    }
  };

  const handleContentClick = (event: MouseEvent) => {
    updateChange(BackgroundSizeTypes.Content);
  };

  const handleLargeClick = (event: MouseEvent) => {
    updateChange(BackgroundSizeTypes.Large);
  };

  return (
    <div className={clsx("bg-size-list-wrapper", className, { disabled })}>
      {title && <span className="bg-size-title">{title}</span>}
      <div
        className={clsx("bg-content-size", {
          selected: size === BackgroundSizeTypes.Content,
        })}
        onClick={handleContentClick}
      />
      <span className="bg-size-lbl">{t("background_size.content")}</span>
      <div
        className={clsx("bg-large-size", {
          selected: size === BackgroundSizeTypes.Large,
        })}
        onClick={handleLargeClick}
      />
      <span className="bg-size-lbl">{t("background_size.large")}</span>
    </div>
  );
}

export default BlmBackgroundSize;
