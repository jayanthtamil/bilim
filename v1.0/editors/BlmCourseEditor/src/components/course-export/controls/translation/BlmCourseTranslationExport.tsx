import React from "react";

import { CourseExportComponent } from "types";
import "./styles.scss";

export interface CompProps extends CourseExportComponent {}

function BlmCourseTranslationExport(props: CompProps) {
  return <div className="course-translation-export-container" />;
}

export default BlmCourseTranslationExport;
