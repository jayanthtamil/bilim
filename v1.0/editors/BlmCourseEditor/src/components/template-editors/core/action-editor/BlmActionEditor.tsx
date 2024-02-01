import React, { Fragment, MouseEvent, useMemo, useRef } from "react";
import { Popper, Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, CourseElementTemplate, TemplateEditorComponent } from "types";
import { ElementType } from "editor-constants";
import { createModifiersForIFrame } from "../../utils";
import { BlmTemplateAction } from "../../containers";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  open: boolean;
  anchorEle: HTMLElement;
  element: CourseElement;
  template: CourseElementTemplate;
  onSave: (template: CourseElementTemplate) => void;
  onClose: (event: MouseEvent) => void;
}

const popperOptions = {
  eventsEnabled: true,
};

function BlmActionEditor(props: CompProps) {
  const { open, anchorEle, element, template, onSave, onClose, openConfirmDialog } = props;
  const elementType = element.type;
  const editorRef = useRef<TemplateEditorComponent | null>(null);
  const { t } = useTranslation();

  const modifiers = useMemo(() => {
    return createModifiersForIFrame(
      -(elementType === ElementType.PartPage || elementType === ElementType.SimplePartPage
        ? 163
        : 64),
      4
    );
  }, [elementType]);

  const openSaveConfirmDialog = () => {
    const options = {
      className: "template-editor-warning-dialog",
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    openConfirmDialog("", `${t("alert.save_changes")}`, handleSave, handleCancel, options);
  };

  const handleSave = (event: MouseEvent) => {
    const editor = editorRef.current;

    if (editor) {
      editor.saveOnClose(event);
    }
  };

  const handleCancel = (event: MouseEvent) => {
    const editor = editorRef.current;

    if (editor) {
      editor.revert();
    }

    handleClose(event);
  };

  const handleBackdropClick = (event: MouseEvent) => {
    const editor = editorRef.current;

    if (editor && editor.isEdited) {
      openSaveConfirmDialog();
    } else {
      handleClose(event);
    }
  };

  const handleClose = (event: MouseEvent) => {
    if (onClose) {
      onClose(event);
    }
  };

  return (
    <Fragment>
      <Popper
        id="scroll-popper"
        open={open}
        anchorEl={open ? anchorEle : null}
        placement="bottom-start"
        popperOptions={popperOptions}
        modifiers={modifiers}
        className="template-action-editor"
      >
        <BlmTemplateAction
          ref={editorRef}
          element={element}
          template={template}
          onSave={onSave}
          onClose={handleClose}
        />
      </Popper>
      <Backdrop
        open={open}
        className="template-action-editor-backdrop"
        onClick={handleBackdropClick}
      />
    </Fragment>
  );
}

export default BlmActionEditor;
