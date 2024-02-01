import React, {
  useState,
  MouseEvent,
  useContext,
  useCallback,
  useRef,
  useEffect,
  ForwardRefRenderFunction,
  useImperativeHandle,
  forwardRef,
} from "react";
import clsx from "clsx";

import { CourseElement, CourseElementTemplate } from "types";
import { TemplateEditorTypes } from "editor-constants";
import { toggleAttributeInString } from "utils";
import { usePrevious } from "hooks";
import { BlmPartPageTemplate } from "../../core";
import { BlmAddPartPage, BlmPartPageToolbox } from "../../controls";
import { BlmTemplateBoardContext } from "../../hoc";
import { usePartPageContainerStyle } from "./styles";

export interface CompProps {
  index: number;
  total: number;
  element: CourseElement;
  template: CourseElementTemplate;
  showControls: boolean;
  onAddClick: (event: MouseEvent<HTMLElement>, templateIndex: number, addIndex: number) => void;
}

export interface PartPageContainer {
  focus: () => void;
}

const BlmPartPageContainer: ForwardRefRenderFunction<PartPageContainer, CompProps> = (
  props,
  ref
) => {
  const { index, total, element, template, showControls, onAddClick } = props;
  const [shouldScrollTo, setShouldScrollTo] = useState(false);
  const {
    editorPanel: { isOpen: isEditorOpen, template: editorTemplate },
    onTemplateEdit,
    onEditClick,
    onDeleteClick,
    onDuplicateClick,
    onPositionChange,
    onNameChange,
  } = useContext(BlmTemplateBoardContext);
  const templateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const classes = usePartPageContainerStyle();
  const prevIndex = usePrevious(index);
  const isPanelOpen = isEditorOpen && editorTemplate && template.id === editorTemplate.id;

  const focus = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView();
    }
  }, []);

  useImperativeHandle(ref, () => ({
    focus,
  }));

  useEffect(() => {
    if (prevIndex !== index && shouldScrollTo) {
      focus();
      setShouldScrollTo(false);
    }
  }, [index, prevIndex, shouldScrollTo, focus]);

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

  const handlePositionChange = (temp: CourseElementTemplate, delta: number) => {
    if (onPositionChange) {
      setShouldScrollTo(true);
      onPositionChange(temp, delta);
    }
  };

  const handleAnchorChange = (template: CourseElementTemplate, hasAnchor: boolean) => {
    if (template) {
      const newTemplate = { ...template };
      const attrs = { anchor: hasAnchor ? "" : undefined };

      newTemplate.hasAnchor = hasAnchor;
      newTemplate.html = toggleAttributeInString(newTemplate.html, attrs, ".outercontainer");

      handleTemplateEdit(newTemplate);
    }
  };

  const renderAddBtn = (templateIndex: number, addIndex: number) => {
    return (
      <BlmAddPartPage
        value={addIndex}
        key={"addBtn" + addIndex}
        className={classes.addBtn}
        onClick={(e) => onAddClick(e, templateIndex, addIndex)}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className={clsx(classes.root, {
        [classes.showControls]: showControls || isPanelOpen,
      })}
    >
      {renderAddBtn(index, index)}
      <BlmPartPageToolbox
        data={template}
        index={index}
        total={total}
        element={element}
        className={classes.controls}
        onEditClick={handleEditClick}
        onDeleteClick={onDeleteClick}
        onDuplicateClick={onDuplicateClick}
        onPositionChange={handlePositionChange}
        onNameChange={onNameChange}
        onAnchorChange={handleAnchorChange}
      />
      <BlmPartPageTemplate
        ref={templateRef}
        key={template.id}
        data={template}
        onTemplateEdit={handleTemplateEdit}
      />
      {renderAddBtn(index, index + 1)}
    </div>
  );
};

export default forwardRef(BlmPartPageContainer);
