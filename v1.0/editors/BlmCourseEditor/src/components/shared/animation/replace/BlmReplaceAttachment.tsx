import React, { ChangeEvent, MouseEvent, useRef } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { AnimationAttachment } from "types";
import { getFileExtension, validateFile } from "utils";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  id: string;
  data: AnimationAttachment;
  className: string;
}

function BlmReplaceAttachment(props: CompProps) {
  const { id, data, className, replaceAnimationAttachment, openDialog } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const { name } = data;
  const ext = getFileExtension(name);
  const accepted = `.${ext}`;
  const { t } = useTranslation("shared");

  const handleFileClick = (event: MouseEvent) => {
    if (fileRef.current) {
      let file = fileRef.current;
      file.click();
      file.value = "";
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length !== 0) {
      const file = files[0];

      try {
        validateFile(file, ext);
        startUpload(file);
      } catch (error) {
        openDialog(`${t("alert.warning")}!`, (error as Error).message);
      }
    }
  };

  const startUpload = (file: File) => {
    replaceAnimationAttachment(id, data, file);
  };

  return (
    <div className={clsx("replace-attachment-wrapper", className)} onClick={handleFileClick}>
      <input
        ref={fileRef}
        type="file"
        accept={accepted}
        className="input-file"
        onChange={handleFileChange}
      />
      {t("title.replace")}
    </div>
  );
}

export default BlmReplaceAttachment;
