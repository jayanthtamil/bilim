import React from "react";

import { CourseElement } from "types";
import { BlmPropertiesBar } from "components/properties";
import { BlmPageTemplates } from "components/templates";
import "./page.scss";

export interface CompProps {
  element: CourseElement;
  child?: CourseElement;
}

function BlmPageElement(props: CompProps) {
  const { element, child } = props;

  return (
    <div className="page-wrapper custom-scrollbar">
      <BlmPropertiesBar element={element} />
      <BlmPageTemplates element={element} child={child} />
    </div>
  );
}

export default BlmPageElement;
