import React, { useState } from "react";
import clsx from "clsx";

import { CourseExternalFile } from "types";
import { getFileExtension } from "utils";
import BlmReplaceFile from "../replace";
import "./styles.scss";
import { createUUID } from "utils";

export interface CompProps {
  data: CourseExternalFile;
}

export const getFileType = (ext: string) => {
  if (ext === "jpg" || ext === "jpg" || ext === "png") {
    return "image";
  }
  return "doc";
};

function BlmCourseStyleFile(props: CompProps) {
  const { data } = props;
  const { name, path } = data;
  const ext = getFileExtension(name);
  const type = getFileType(ext);
  const randomId = createUUID();
  const [uploadId, setUploadId] = useState(randomId);

  const onClose = () => {
    setUploadId(createUUID());
  };

  return (
    <div className={clsx("course-file-wrapper", type)}>
      <div className="course-file-preview">
        <a href={path} target="_blank" rel="noopener noreferrer">
          {type === "image" && <img src={`${path}?${uploadId}`} alt={name} />}
        </a>
      </div>
      <a href={path} download className="course-file-download-btn">
        <div className="course-file-download-btn" />
      </a>
      <BlmReplaceFile data={data} onClose={onClose} />
      <div className="course-file-name">{name}</div>
    </div>
  );
}

export default BlmCourseStyleFile;
