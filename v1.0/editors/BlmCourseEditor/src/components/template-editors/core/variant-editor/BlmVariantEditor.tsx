import React, { Fragment, MouseEvent, useLayoutEffect, useRef } from "react";
import { Popper, Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  CourseElement,
  CourseElementTemplate,
  TemplateEditorComponent,
  TemplatePanelOptions,
} from "types";
import { PanelCloseReasons } from "editor-constants";
import { isElementVisibleInFrame } from "utils";
import { createModifiersForIFrame } from "../../utils";
import { BlmTemplateVariants } from "../../containers";
import { ContainerProps } from "./variant-editor-container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  open: boolean;
  anchorEle: HTMLElement;
  templateEle: HTMLElement;
  element: CourseElement;
  template: CourseElementTemplate;
  onPreview: (template: CourseElementTemplate) => void;
  onMore: (options: TemplatePanelOptions) => void;
  onSave: (template: CourseElementTemplate) => void;
  onClose: (event: MouseEvent, reason: PanelCloseReasons) => void;
}

const popperOptions = {
  eventsEnabled: true,
};
const modifiers = createModifiersForIFrame(-18, 1);

function BlmVariantEditor(props: CompProps) {
  const {
    open,
    anchorEle,
    templateEle,
    element,
    template,
    onPreview,
    onMore,
    onSave,
    onClose,
    openConfirmDialog,
  } = props;
  const editorRef = useRef<TemplateEditorComponent | null>(null);
  const { t } = useTranslation();

  //BILIM-276: [react] option popup move when scroll and edit
  useLayoutEffect(() => {
    setTimeout(() => {
      if (!isElementVisibleInFrame(anchorEle)) {
        anchorEle.scrollIntoView();
      }
    });
  });

  const openSaveConfirmDialog = () => {
    const options = {
      className: "template-editor-warning-dialog",
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    openConfirmDialog(
      `${t("alert.cancel_confirm")}`,
      `${t("alert.save_changes")}`,
      handleSave,
      handleCancel,
      options
    );
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
        id="variant-popper"
        open={open}
        anchorEl={open ? anchorEle : null}
        placement="bottom-start"
        popperOptions={popperOptions}
        modifiers={modifiers}
        className="variant-editor"
      >
        <BlmTemplateVariants
          ref={editorRef}
          element={element}
          template={template}
          templateEle={templateEle}
          onPreview={onPreview}
          onMore={onMore}
          onSave={onSave}
          onClose={handleClose}
        />
      </Popper>
      <Backdrop open={open} className="variant-editor-backdrop" onClick={handleBackdropClick} />
    </Fragment>
  );
}

export default BlmVariantEditor;
