import React, { FocusEvent, forwardRef, memo, useEffect, useMemo, useRef, useState } from "react";
import { TProcessingInstruction } from "html-to-react";

import { ElementType } from "editor-constants";
import {
  addClassToString,
  updateInnerHTML,
  createReactAttribs,
  removeElementInString,
  createHTMLElement,
  toNumber,
} from "utils";
import { BlmHTMLParser } from "shared";
import { TextEditorChangeEvent } from "components/component-editor";
import { BlmText, BlmMedia, BlmHTMLMedia, BlmButton } from "../../components";
import { validateAllowDelete } from "./utilts";
import { TemplateCompProps } from "./types";

interface EditState {
  status: boolean;
  html: string;
  timeoutId?: number;
}

const BlmTemplate = forwardRef<HTMLDivElement, TemplateCompProps>((props, ref) => {
  const { data, onTemplateEdit, ...others } = props;
  const { templateType, html } = data;
  const editRef = useRef<EditState>({
    status: false,
    html,
    timeoutId: undefined,
  });
  const [content, setContent] = useState(html);
  const [hoverMedia, setHoverMedia] = useState(false);

  const mediaIds = useMemo(() => {
    const doc = createHTMLElement(html);

    if (doc) {
      return Array.from(doc.querySelectorAll(`[blm-component="media"]`))
        .map((media) => media.getAttribute("blm-id") || "")
        .sort((id1, id2) => toNumber(id1) - toNumber(id2));
    }
  }, [html]);

  useEffect(() => {
    editRef.current = { status: false, html, timeoutId: undefined };
    setContent(html);
  }, [html]);

  const updateEdit = () => {
    const { status, html: editedHtml } = editRef.current;

    if (status) {
      const newData = { ...data };

      newData.html = editedHtml;
      editRef.current.status = false;

      setContent(editedHtml);

      if (onTemplateEdit) {
        onTemplateEdit(newData);
      }
    }
  };

  const handleChange = (event: TextEditorChangeEvent) => {
    const { name, value } = event.target;
    const updatedHtml = updateInnerHTML(editRef.current.html, name, value);

    editRef.current = { status: true, html: updatedHtml };
  };

  const handleComponentDelete = (selector: string) => {
    const updatedHtml = addClassToString(editRef.current.html, ["deactivated"], selector);

    editRef.current = { status: true, html: updatedHtml };

    updateEdit();
  };

  const handleRepeaterDelete = (selector: string) => {
    const updatedHtml = removeElementInString(editRef.current.html, selector);

    editRef.current = { status: true, html: updatedHtml };

    updateEdit();
  };

  // If a child receives focus, do not close the popover.
  const handleFocus = () => {
    clearTimeout(editRef.current.timeoutId);
  };

  // We save the template on the next tick by using setTimeout.
  // This is necessary because we need to first check if
  // another child of the element has received focus as
  // the blur event fires prior to the new focus event.
  const handleBlur = (event: FocusEvent) => {
    editRef.current.timeoutId = setTimeout(updateEdit);
  };

  const handleMediaEnter = () => {
    setHoverMedia(true);
  };

  const handleMediaLeave = () => {
    setHoverMedia(false);
  };

  const processingInstructions: TProcessingInstruction[] = [
    {
      shouldProcessNode: function (node) {
        if (node.attribs && node.attribs["blm-id"] && node.attribs["blm-component"] === "text")
          return templateType === ElementType.Question
            ? node.attribs["blm-editable"] !== undefined
            : true;
        else return false;
      },
      processNode: function (node, children) {
        const { attribs } = node;

        return (
          <BlmText
            template={templateType}
            onChange={handleChange}
            onDelete={handleComponentDelete}
            {...(createReactAttribs(attribs) as any)}
          >
            {children}
          </BlmText>
        );
      },
    },
    {
      shouldProcessNode: function (node) {
        if (node.attribs && node.attribs["blm-id"] && node.attribs["blm-component"] === "media")
          return true;
        else return false;
      },
      processNode: function (node, children) {
        const { attribs, parent } = node;
        const ind = mediaIds?.indexOf(attribs["blm-id"]) || 0;
        const isRepeater = parent.attribs["blm-component"] === "repeater";
        const allowDelete = !isRepeater || validateAllowDelete(parent);

        return (
          <BlmMedia
            allowDelete={allowDelete}
            order={ind + 1}
            hover={hoverMedia}
            onDelete={isRepeater ? handleRepeaterDelete : handleComponentDelete}
            onMouseEnter={handleMediaEnter}
            onMouseLeave={handleMediaLeave}
            {...(createReactAttribs(attribs) as any)}
          >
            {children}
          </BlmMedia>
        );
      },
    },
    {
      shouldProcessNode: function (node) {
        if (node.attribs && node.attribs["blm-id"] && node.attribs["blm-component"] === "button")
          return true;
        else return false;
      },
      processNode: function (node, children) {
        const { attribs } = node;

        return <BlmButton {...(createReactAttribs(attribs) as any)}>{children}</BlmButton>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return node.name === "video" || node.name === "audio";
      },
      processNode: function (node, children) {
        const { name, attribs } = node;

        return (
          <BlmHTMLMedia type={name} {...(createReactAttribs(attribs) as any)}>
            {children}
          </BlmHTMLMedia>
        );
      },
    },
  ];

  return (
    <div ref={ref} onFocus={handleFocus} onBlur={handleBlur} {...others}>
      <BlmHTMLParser html={content} processingInstructions={processingInstructions} />
    </div>
  );
});

export default memo(BlmTemplate);
