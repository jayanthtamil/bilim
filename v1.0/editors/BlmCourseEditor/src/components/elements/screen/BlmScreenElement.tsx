import React from "react";

import { CourseElement } from "types";
import { BlmPropertiesBar } from "components/properties";
import { BlmScreenTemplates } from "components/templates";
import "./screen.scss";

export interface CompProps {
  element: CourseElement;
}

function BlmScreenElement(props: CompProps) {
  const { element } = props;

  return (
    <div className="screen-wrapper custom-scrollbar">
      <BlmPropertiesBar element={element} />
      <BlmScreenTemplates element={element} />
    </div>
  );
}

export default BlmScreenElement;
