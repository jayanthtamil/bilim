import React from "react";
import { useTranslation } from "react-i18next";

import { CoursePropsComponent } from "types";
import { formatDate } from "utils";
import "./styles.scss";

export interface CompProps extends Omit<CoursePropsComponent, "onChange"> {}

function BlmCourseLogProps(props: CompProps) {
  const { data } = props;
  const { created, modified } = data;
  const { t } = useTranslation();

  if (data) {
    return (
      <div className="course-properties-log-container">
        <div className="course-properties-log-lbl">{t("log.created_on")} :</div>
        <div className="course-properties-log-name">{formatDate(created.date)}</div>
        <div className="course-properties-log-lbl">{t("log.modified_on")} :</div>
        <div className="course-properties-log-name">{formatDate(modified.date)}</div>
        <div className="course-properties-log-hr" />
        <div className="course-properties-log-lbl">{t("log.created_by")} :</div>
        <div className="course-properties-log-name">{created.user}</div>
        <div className="course-properties-log-lbl">{t("log.modified_by")} :</div>
        <div className="course-properties-log-name">{modified.user}</div>
      </div>
    );
  } else {
    return null;
  }
}

export default BlmCourseLogProps;
