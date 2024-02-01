import React, { Fragment, useRef } from "react";
import { Popper, Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, PropertiesEditorComponent } from "types";
import { ElementType } from "editor-constants";
import { BlmChapterProps, BlmCustomProps, BlmSummaryProps } from "../../containers";
import { ContainerProps } from "./properties-panel-container";
import "./properties-panel.scss";

export interface CompProps extends ContainerProps {
  element: CourseElement;
}

const modifiers = {
  offset: {
    offset: "0,0",
    enabled: true,
  },
  flip: {
    enabled: false,
  },
  keepTogether: {
    enabled: false,
  },
  arrow: {
    enabled: false,
  },
  preventOverflow: {
    enabled: false,
  },
  hide: {
    enabled: false,
  },
};

function BlmPropertiesPanel(props: CompProps) {
  const {
    element,
    open,
    anchorEle,
    selectTreeItem,
    setElementPropertiesTabIndex,
    openConfirmDialog,
  } = props;
  const editorRef = useRef<PropertiesEditorComponent | null>(null);
  const { t } = useTranslation();

  const openSaveConfirmDialog = () => {
    const options = {
      className: "template-editor-warning-dialog",
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    openConfirmDialog("", `${t("alert.save_changes")}`, handleClose, handleCancel, options);
  };

  const revertChanges = () => {
    const editor = editorRef.current;

    if (editor && editor.isEdited) {
      editor.revert();
    }
  };

  const closePanel = () => {
    selectTreeItem();
    setElementPropertiesTabIndex(0);
  };

  const handleClose = () => {
    closePanel();
  };

  const handleCancel = () => {
    revertChanges();
    closePanel();
  };

  const handleBackdropClose = () => {
    const editor = editorRef.current;

    if (editor && editor.isEdited) {
      openSaveConfirmDialog();
    } else {
      closePanel();
    }
  };

  const renderChildren = () => {
    if (!element) {
      return null;
    } else if (element.type === ElementType.Chapter) {
      return <BlmChapterProps ref={editorRef} element={element} />;
    } else if (element.type === ElementType.Custom) {
      return <BlmCustomProps ref={editorRef} element={element} />;
    } else if (element.type === ElementType.Summary && element.parent) {
      return <BlmSummaryProps ref={editorRef} element={element.parent} />;
    }
  };

  return (
    <Fragment>
      <Backdrop open={open} className="properties-panel-backdrop" onClick={handleBackdropClose} />
      <Popper
        open={open}
        anchorEl={open ? anchorEle : null}
        placement="right-start"
        modifiers={modifiers}
        className="properties-panel"
      >
        <div className="properties-panel-container">
          <div className="properties-panel-close-btn" onClick={handleClose} />
          {renderChildren()}
        </div>
      </Popper>
    </Fragment>
  );
}

export default BlmPropertiesPanel;
