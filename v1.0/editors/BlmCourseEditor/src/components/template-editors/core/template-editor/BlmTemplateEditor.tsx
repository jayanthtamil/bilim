import React, { MouseEvent, useRef } from "react";
import { Drawer } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElementTemplate, CourseElement, TemplateEditorComponent } from "types";
import { ElementType } from "editor-constants";
import { BlmFontStyles } from "components/frames";
import { BlmContentEditor } from "components/content-editor";
import { BlmQuestionEditor } from "components/question-editor";
import { ContainerProps } from "./template-editor-container";
import "./template-editor.scss";

interface CompProps extends ContainerProps {
  open: boolean;
  frameEle: HTMLElement;
  element: CourseElement;
  template: CourseElementTemplate;
  onSave: (template: CourseElementTemplate) => void;
  onClose: (event: MouseEvent) => void;
}

function BlmTemplateEditor(props: CompProps) {
  const { open, frameEle, element, template, onSave, onClose, openConfirmDialog } = props;
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

    handleClose(event);
  };

  const handleDrawerClose = (event: any) => {
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
    <Drawer
      className="template-editor-drawer"
      open={open}
      disableEnforceFocus
      onClose={handleDrawerClose}
    >
      <BlmFontStyles />
      {template.templateType === ElementType.Question ? (
        <BlmQuestionEditor
          ref={editorRef}
          element={element}
          template={template}
          onSave={onSave}
          onClose={handleClose}
        />
      ) : (
        <BlmContentEditor
          ref={editorRef}
          element={element}
          frameEle={frameEle}
          template={template}
          onSave={onSave}
          onClose={handleClose}
        />
      )}
    </Drawer>
  );
}

export default BlmTemplateEditor;
