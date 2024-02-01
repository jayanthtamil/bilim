import React, { useCallback, useContext, useRef } from "react";

import { CourseElement, CourseElementTemplate } from "types";
import { TemplateEditorTypes } from "editor-constants";
import { BlmQuestionTemplate } from "../../core";
import { BlmTemplateBoardContext, withBlmTemplateBoard } from "../../hoc";
import { BlmContentToolbox } from "../../controls/";
import { useQuestionContainerStyle } from "./styles";

interface CompProps {
  element: CourseElement;
  templates?: CourseElementTemplate[];
}

function BlmQuestionContainer(props: CompProps) {
  const { element, templates } = props;
  const classes = useQuestionContainerStyle();
  const { onTemplateEdit, onEditClick } = useContext(BlmTemplateBoardContext);
  const templateRef = useRef<HTMLDivElement>(null);

  const handleTemplateEdit = useCallback(
    (temp: CourseElementTemplate) => {
      if (onTemplateEdit) {
        onTemplateEdit(temp);
      }
    },
    [onTemplateEdit]
  );

  const handleEditClick = (
    type: TemplateEditorTypes,
    temp: CourseElementTemplate,
    anchorEle: HTMLElement
  ) => {
    if (onEditClick && templateRef.current) {
      onEditClick(type, temp, anchorEle, templateRef.current);
    }
  };

  if (templates && templates.length > 0) {
    const template = templates[0];

    return (
      <div className={classes.root}>
        <BlmContentToolbox
          element={element}
          data={template}
          className={classes.controls}
          onEditClick={handleEditClick}
        />
        <BlmQuestionTemplate
          ref={templateRef}
          data={template}
          onTemplateEdit={handleTemplateEdit}
        />
      </div>
    );
  } else {
    return null;
  }
}

export default withBlmTemplateBoard(BlmQuestionContainer);
