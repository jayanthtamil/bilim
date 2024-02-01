import React, { Fragment, MouseEvent, useState, useEffect, useMemo } from "react";
import { Popper, Backdrop } from "@material-ui/core";

import { CourseElement, CourseElementTemplate } from "types";
import { ElementType } from "editor-constants";
import { filterElements, getElementBySelector, toggleAttributeInString, toJSONString } from "utils";
import { createModifiersForIFrame } from "../../utils";
import { BlmAssociatedChapter } from "../../containers";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  open: boolean;
  anchorEle: HTMLElement;
  element: CourseElement;
  template: CourseElementTemplate;
  onSave?: (template: CourseElementTemplate) => void;
  onClose?: (event: MouseEvent) => void;
}

const popperOptions = {
  eventsEnabled: true,
};
const modifiers = createModifiersForIFrame(4, 0);

const createTemplate = (template: CourseElementTemplate, element: CourseElement) => {
  const newTemplate = { ...template };
  const rootElement = getElementBySelector(template.html, ".outercontainer");

  if (rootElement) {
    const options = { ...template.options, relative_chapter: element.id };
    const attrs = { "blm-options": toJSONString(options) };

    newTemplate.options = options;
    newTemplate.html = toggleAttributeInString(newTemplate.html, attrs, ".outercontainer");
  }

  return newTemplate;
};

const getAssociatedParent = (element: CourseElement) => {
  let result: CourseElement | undefined = element;

  while (result && result.type !== ElementType.Chapter && result.type !== ElementType.Structure) {
    result = result.parent;
  }

  return result;
};

function BlmAssociatedChapterEditor(props: CompProps) {
  const { open, anchorEle, element, template, course, onSave, onClose } = props;
  const { associatedChapter } = template;
  const [data, setData] = useState<CourseElement>();
  const [associated, setAssociated] = useState(associatedChapter);

  const showClose = useMemo(() => {
    return Boolean(
      associated ||
        (data &&
          data.type !== ElementType.Chapter &&
          filterElements(data.children, [ElementType.Chapter]).length === 0)
    );
  }, [data, associated]);

  useEffect(() => {
    if (element && course) {
      const result = getAssociatedParent(element);

      if (result) {
        if (result.type === ElementType.Structure) {
          const root = new CourseElement(course.id, "Course root", ElementType.Root);
          root.children = result.children;

          setData(root);
        } else {
          setData(result);
        }
      }
    }
  }, [element, course]);

  const handleChange = (item: CourseElement) => {
    setAssociated(item);
  };

  const handleClose = (event: MouseEvent) => {
    if (onSave && associated && template.options?.relative_chapter !== associated.id) {
      const newTemplate = createTemplate(template, associated);

      onSave(newTemplate);
    }

    if (onClose) {
      onClose(event);
    }
  };

  if (data) {
    return (
      <Fragment>
        <Popper
          id="associated-chapter-popper"
          open={open}
          anchorEl={open ? anchorEle : null}
          placement="bottom-start"
          popperOptions={popperOptions}
          modifiers={modifiers}
          className="associated-chapter-editor"
        >
          <BlmAssociatedChapter
            data={data}
            associated={associated}
            showClose={showClose}
            onChange={handleChange}
            onClose={handleClose}
          />
        </Popper>
        <Backdrop
          open={open}
          className="associated-chapter-editor-backdrop"
          onClick={showClose ? handleClose : undefined}
        />
      </Fragment>
    );
  } else {
    return null;
  }
}

export default BlmAssociatedChapterEditor;
