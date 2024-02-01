import React, { Fragment, useRef, useState } from "react";
import { Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, ElementPropsChangeHandler, PropertiesEditorComponent } from "types";
import { ElementType } from "editor-constants";
import { BlmPageProps, BlmQuestionProps, BlmScreenProps } from "../../containers";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  element: CourseElement;
  onChange?: ElementPropsChangeHandler;
}

function BlmPropertiesBar(props: CompProps) {
  const { element, openConfirmDialog, onChange } = props;
  const [tabIndex, setTabIndex] = useState<false | number>(false);
  const editorRef = useRef<PropertiesEditorComponent | null>(null);
  const bgEditorRef = useRef<PropertiesEditorComponent | null>(null);
  const { t } = useTranslation();

  const openSaveConfirmDialog = () => {
    const onOk = () => {
      handleClose();
    };
    const onCancel = () => {
      revertChanges();
      closePanel();
    };
    const options = {
      className: "template-editor-warning-dialog",
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    openConfirmDialog(
      `${t("alert.warning")}`,
      `${t("alert.save_changes")}`,
      onOk,
      onCancel,
      options
    );
  };

  const isEdited = () => {
    return editorRef.current?.isEdited || bgEditorRef.current?.isEdited;
  };

  const saveChanges = () => {
    const editor = editorRef.current;
    const bgEditor = bgEditorRef.current;

    if (editor && editor.isEdited) {
      editor.save();
    } else if (bgEditor && bgEditor.isEdited) {
      bgEditor.save();
    }
  };

  const revertChanges = () => {
    const editor = editorRef.current;
    const bgEditor = bgEditorRef.current;

    if (editor && editor.isEdited) {
      editor.revert();
    } else if (bgEditor && bgEditor.isEdited) {
      bgEditor.revert();
    }
  };

  const closePanel = () => {
    setTabIndex(false);
  };

  const handleBackdropClose = () => {
    if (isEdited()) {
      openSaveConfirmDialog();
    } else {
      closePanel();
    }
  };

  const handleTabChange = (value: number) => {
    if (tabIndex !== value) {
      saveChanges();
      setTabIndex(value);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    saveChanges();
    closePanel();
  };

  const renderChildren = () => {
    if (!element) {
      return null;
    } else if (element.type === ElementType.Page || element.type === ElementType.SimplePage) {
      return (
        <BlmPageProps
          ref={editorRef}
          element={element}
          tabIndex={tabIndex}
          autoSave={false}
          onChange={onChange}
          onTabChange={handleTabChange}
          onClose={handleClose}
        />
      );
    } else if (element.type === ElementType.Screen || element.type === ElementType.SimpleContent) {
      return (
        <BlmScreenProps
          ref={editorRef}
          bgRef={bgEditorRef}
          element={element}
          tabIndex={tabIndex}
          autoSave={false}
          onTabChange={handleTabChange}
          onClose={handleClose}
        />
      );
    } else if (element.type === ElementType.Question) {
      return (
        <BlmQuestionProps
          ref={editorRef}
          bgRef={bgEditorRef}
          element={element}
          tabIndex={tabIndex}
          autoSave={false}
          onTabChange={handleTabChange}
          onClose={handleClose}
        />
      );
    }
  };

  return (
    <Fragment>
      {tabIndex !== false && (
        <Backdrop
          open={true}
          className="element-properties-backdrop"
          onClick={handleBackdropClose}
        />
      )}
      {renderChildren()}
    </Fragment>
  );
}

export default BlmPropertiesBar;
