import React, { PropsWithChildren } from "react";

import { CourseElementTemplate } from "types";
import "./styles.scss";

export interface CompProps {
  label: string;
  template: CourseElementTemplate;
}

function BlmQuestionDashboard(props: PropsWithChildren<CompProps>) {
  const { label, template, children } = props;

  return (
    <div className="question-editor-dashboard">
      <div className="question-editor-title">{template.name}</div>
      <span className="question-editor-label">{label}</span>
      {children}
    </div>
  );
}

export default BlmQuestionDashboard;
