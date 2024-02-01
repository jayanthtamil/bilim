import React from "react";

import { CourseElement } from "types";
import { BlmPropertiesBar } from "components/properties";
import { BlmQuestionTemplates } from "components/templates";
import "./question.scss";

export interface CompProps {
  element: CourseElement;
}

function BlmQuestionElement(props: CompProps) {
  const { element } = props;

  return (
    <div className="question-wrapper custom-scrollbar">
      <BlmPropertiesBar element={element} />
      <BlmQuestionTemplates element={element} />
    </div>
  );
}

export default BlmQuestionElement;
