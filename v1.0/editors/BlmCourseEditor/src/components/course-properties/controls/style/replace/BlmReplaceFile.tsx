import React, { ChangeEvent, MouseEvent, useRef } from "react";
import { useTranslation } from "react-i18next";

import { CourseExternalFile } from "types";
import { getFileExtension, validateFile } from "utils";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  data: CourseExternalFile;
  onClose?: () => void;
}

function BlmReplaceFile(props: CompProps) {
  const { data, replaceCourseFile, openDialog, onClose } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const { name } = data;
  const ext = getFileExtension(name);
  const accepted = `.${ext}`;
  const { t } = useTranslation();

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
    replaceCourseFile(data, file).then(() => {
      if (onClose) {
        onClose();
      }
    });
  };

  return (
    <div className="course-file-replace-btn" onClick={handleFileClick}>
      <input
        ref={fileRef}
        type="file"
        accept={accepted}
        className="input-file"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default BlmReplaceFile;
