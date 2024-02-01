import React, { Fragment, MouseEvent, useRef } from "react";
import { Popper, Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, PropertiesEditorComponent } from "types";
import { TemplateEditorTypes } from "editor-constants";
import { BlmPartPageProps } from "components/properties";
import { createModifiersForIFrame } from "../../utils";
import { ContainerProps } from "./properties-editor-container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  open: boolean;
  anchorEle: HTMLElement;
  element: CourseElement;
  type: TemplateEditorTypes;
  onClose: (event: MouseEvent) => void;
}

const popperOptions = {
  eventsEnabled: true,
};
const modifiers = createModifiersForIFrame(-51, 5);

function BlmPropertiesEditor(props: CompProps) {
  const { open, anchorEle, element, type, onClose, openConfirmDialog } = props;
  const editorRef = useRef<PropertiesEditorComponent | null>(null);
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

    if (editor && editor.isEdited) {
      editor.save();
    }

    handleClose(event);
  };

  const handleCancel = (event: MouseEvent) => {
    const editor = editorRef.current;

    if (editor && editor.isEdited) {
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
        id="properties-popper"
        open={open}
        anchorEl={open ? anchorEle : null}
        placement="bottom-start"
        popperOptions={popperOptions}
        modifiers={modifiers}
        className="template-props-editor"
      >
        {element && (
          <BlmPartPageProps
            ref={editorRef}
            element={element}
            type={type}
            autoSave={false}
            autoClear={false}
            onClose={handleClose}
          />
        )}
      </Popper>
      <Backdrop
        open={open}
        className="template-props-editor-backdrop"
        onClick={handleBackdropClick}
      />
    </Fragment>
  );
}

export default BlmPropertiesEditor;
