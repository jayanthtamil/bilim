import React from "react";
import { useTranslation } from "react-i18next";

import { CourseExternalText, CourseProps, CoursePropsComponent } from "types";
import { updateObject } from "utils";
import BlmCourseTranslationItem from "./items";
import "./styles.scss";

export interface CompProps extends CoursePropsComponent {}

function BlmCourseTranslationProps(props: CompProps) {
  const { data, onChange } = props;
  const { texts } = data;
  const { t } = useTranslation();

  const updateChange = (newData: CourseProps) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (item: CourseExternalText) => {
    const newData = { ...data, texts: updateObject(texts, "name", item.name, item) };

    updateChange(newData);
  };

  return (
    <div className="course-translation-props-wrapper">
      <div className="course-translation-icon" />
      <div className="course-translation-header">
        <span>{t("translation.original")}</span>
      </div>
      <div className="course-translation-header">
        <span>{t("translation.translated")}</span>
      </div>
      <div className="course-translation-list custom-scrollbar">
        {texts.map((item) => (
          <BlmCourseTranslationItem key={item.name} data={item} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}
export default BlmCourseTranslationProps;
