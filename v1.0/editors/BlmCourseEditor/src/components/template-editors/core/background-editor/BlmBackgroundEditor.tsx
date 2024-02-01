import React, { Fragment, MouseEvent, useRef } from "react";
import { Popper, Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElementTemplate, TemplateEditorComponent } from "types";
import { PanelCloseReasons } from "editor-constants";
import { createModifiersForIFrame } from "../../utils";
import { BlmTemplateBackground } from "../../containers";
import { ContainerProps } from "./background-editor-container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  open: boolean;
  anchorEle: HTMLElement;
  template: CourseElementTemplate;
  onPreview: (template: CourseElementTemplate) => void;
  onSave: (template: CourseElementTemplate) => void;
  onClose: (event: MouseEvent, reason: PanelCloseReasons) => void;
}

const popperOptions = {
  eventsEnabled: true,
};
const modifiers = createModifiersForIFrame(-69, 2);

function BlmBackgroundEditor(props: CompProps) {
  const { open, anchorEle, template, onPreview, onSave, onClose, openConfirmDialog } = props;
  const editorRef = useRef<TemplateEditorComponent | null>(null);
  const { t } = useTranslation();

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

    handleClose(event, PanelCloseReasons.Cancel);
  };

  const handleBackdropClick = (event: MouseEvent) => {
    const editor = editorRef.current;

    if (editor && editor.isEdited) {
      openSaveConfirmDialog();
    } else {
      handleClose(event);
    }
  };

  const handleClose = (event: MouseEvent, reason = PanelCloseReasons.Close) => {
    if (onClose) {
      onClose(event, reason);
    }
  };

  return (
    <Fragment>
      <Popper
        id="background-popper"
        open={open}
        anchorEl={open ? anchorEle : null}
        placement="bottom-start"
        popperOptions={popperOptions}
        modifiers={modifiers}
        className="template-bg-editor"
      >
        <BlmTemplateBackground
          ref={editorRef}
          template={template}
          onPreview={onPreview}
          onSave={onSave}
          onClose={handleClose}
        />
      </Popper>
      <Backdrop open={open} className="template-bg-editor-backdrop" onClick={handleBackdropClick} />
    </Fragment>
  );
}

export default BlmBackgroundEditor;
