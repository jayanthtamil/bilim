import React, { MouseEvent, useRef, useLayoutEffect } from "react";
import clsx from "clsx";

import { CourseElement, CourseElementTemplate } from "types";
import { ElementType, TemplateEditorTypes } from "editor-constants";
import { useTemplateBtnStyle } from "./styles";

interface CompProps {
  element: CourseElement;
  data: CourseElementTemplate;
  className?: string;
  onEditClick?: (
    type: TemplateEditorTypes,
    template: CourseElementTemplate,
    anchorEle: HTMLElement
  ) => void;
}

function BlmContentToolbox(props: CompProps) {
  const { element, data, className, onEditClick } = props;
  const classes = useTemplateBtnStyle();
  const { isOutdated, forAlertIcon } = element;
  const { hasAction, isSummary, options, associatedChapter } = data;
  const associateRef = useRef<HTMLDivElement>(null);
  const associatedChapterId = options?.relative_chapter;

  useLayoutEffect(() => {
    const container = associateRef.current;

    if (isSummary && !associatedChapterId && container) {
      setTimeout(() => {
        container.click();
        container.scrollIntoView();
      }, 700);
    }
  }, [isSummary, associatedChapterId, associateRef]);

  const handleEditClick = (type: TemplateEditorTypes, anchorEle: HTMLElement) => {
    if (onEditClick) {
      onEditClick(type, data, anchorEle);
    }
  };

  const handleTemplateClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.Template, event.currentTarget);
  };

  const handleVariantClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.Variant, event.currentTarget);
  };

  const handleActionClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.Action, event.currentTarget);
  };

  const handleAssociatedChapterClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.AssociatedChapter, event.currentTarget);
  };

  return (
    <div
      className={clsx(classes.root, className, { [classes.outdated]: isOutdated && forAlertIcon })}
    >
      <div className={classes.editBtn} onClick={handleTemplateClick} />
      <div className={classes.variantsBtn} onClick={handleVariantClick} />
      <div
        className={clsx(classes.actionBtn, { [classes.actionActiveBtn]: hasAction })}
        onClick={handleActionClick}
      />
      {isSummary && data.type === ElementType.SimpleContent && (
        <div
          ref={associateRef}
          className={classes.associatedChapterBtn}
          onClick={handleAssociatedChapterClick}
        >
          {associatedChapter ? associatedChapter.name : ""}
        </div>
      )}
    </div>
  );
}

export default BlmContentToolbox;
