import React from "react";

import { ElementPropsComponent, CourseElementProps } from "types";
import { getFilesPropsJSON } from "utils";
import { BlmAnimation, MediaPickerChangeEvent } from "components/shared";
import "./styles.scss";

export interface CompProps extends ElementPropsComponent {}

export default function BlmFilesProps(props: CompProps) {
  const { data, onChange } = props;
  const { filesJSON } = data;

  const updateChange = (newData: CourseElementProps) => {
    if (onChange) {
      onChange({ ...newData, propsJSON: getFilesPropsJSON(newData.filesJSON, newData.propsJSON) });
    }
  };

  const handleChange = (event: MediaPickerChangeEvent) => {
    const { name, value } = event.target;
    const newData = { ...data };

    if (name === "media") {
      newData.filesJSON = value || null;
    }

    updateChange(newData);
  };

  return (
    <div className="custom-files-props-wrapper">
      <BlmAnimation elementId={data.id} data={filesJSON} onChange={handleChange} />
    </div>
  );
}
