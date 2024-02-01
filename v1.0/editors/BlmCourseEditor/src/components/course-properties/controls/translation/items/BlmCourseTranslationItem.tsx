import React, { ChangeEvent, useRef } from "react";

import { CourseExternalText } from "types";
import BlmAutoTextArea from "shared/auto-textarea";
import "./styles.scss";

export interface CompProps {
  data: CourseExternalText;
  onChange?: (data: CourseExternalText) => void;
}

function BlmCourseTranslationItem(props: CompProps) {
  const { data, onChange } = props;
  const { value, comment } = data;
  const { current: label } = useRef(value);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      const newData = { ...data };
      newData.value = event.target.value;

      onChange(newData);
    }
  };

  return (
    <div className="course-translation-item-wrapper">
      <div title={comment} className="course-translation-item-lbl">
        {label}
      </div>
      <BlmAutoTextArea
        value={value}
        className="course-translation-item-txt"
        onChange={handleChange}
      />
    </div>
  );
}

export default BlmCourseTranslationItem;
