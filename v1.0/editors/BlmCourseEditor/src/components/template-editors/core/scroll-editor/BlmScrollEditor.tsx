import React, { Fragment, MouseEvent, useRef } from "react";
import { Popper, Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElementTemplate, TemplateEditorComponent } from "types";
import { createModifiersForIFrame } from "../../utils";
import { BlmTemplateScroll } from "../../containers";
import { ContainerProps } from "./scroll-editor-container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  open: boolean;
  anchorEle: HTMLElement;
  template: CourseElementTemplate;
  onSave: (template: CourseElementTemplate) => void;
  onClose: (event: MouseEvent) => void;
}

const popperOptions = {
  eventsEnabled: true,
};
const modifiers = createModifiersForIFrame(-112, 1);

function BlmScrollEditor(props: CompProps) {
  const { open, anchorEle, template, onSave, onClose, openConfirmDialog } = props;
  const editorRef = useRef<TemplateEditorComponent | null>(null);
  const { t } = useTranslation();

  const openSaveConfirmDialog = () => {
    const options = {
      className: "template-editor-warning-dialog",
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    openConfirmDialog("", `${t("alert.save_changes")}`, handleSave, handleClose, options);
  };

  const handleSave = (event: MouseEvent) => {
    const editor = editorRef.current;

    if (editor) {
      editor.saveOnClose(event);
    }
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
        className="template-scroll-editor"
      >
        <BlmTemplateScroll
          ref={editorRef}
          template={template}
          onSave={onSave}
          onClose={handleClose}
        />
      </Popper>
      <Backdrop
        open={open}
        className="template-scroll-editor-backdrop"
        onClick={handleBackdropClick}
      />
    </Fragment>
  );
}

export default BlmScrollEditor;
