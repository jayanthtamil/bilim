import React, { MouseEvent, useState } from "react";
import { Drawer } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { AnimationTranslation } from "types";
import { updateObject } from "utils";
import BlmTranslationItem from "./item";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  open: boolean;
  data: AnimationTranslation[];
  onSave?: (data: AnimationTranslation[]) => void;
  onClose?: (event: MouseEvent) => void;
}

function BlmTranslationEditor(props: CompProps) {
  const { open, data, onSave, onClose, openConfirmDialog } = props;
  const [state, setState] = useState({ translations: data, isEdited: false });
  const { translations, isEdited } = state;
  const { t } = useTranslation("shared");

  const saveChanges = () => {
    if (onSave) {
      onSave(translations);
    }
  };

  const handleChange = (translation: AnimationTranslation) => {
    if (translations) {
      setState({
        translations: updateObject(translations, "id", translation.id, translation),
        isEdited: true,
      });
    }
  };

  const handleSave = (event: MouseEvent) => {
    if (isEdited) {
      saveChanges();
    }

    handleClose(event);
  };

  const openSaveConfirmDialog = () => {
    const onOk = (event: MouseEvent) => {
      handleSave(event);
    };
    const onCancel = (event: MouseEvent) => {
      handleClose(event);
    };
    const options = {
      className: "template-editor-warning-dialog",
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    openConfirmDialog(
      `${t("alert.cancel_confirm")}`,
      `${t("alert.save_all_changes")}`,
      onOk,
      onCancel,
      options
    );
  };

  const handleDrawerClose = (event: any) => {
    if (isEdited) {
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
    <Drawer className="translation-editor-drawer" open={open} onClose={handleDrawerClose}>
      <div className="translation-editor-wrapper">
        <div className="translation-title">{t("translation_editor.translate_texts")}</div>
        <div className="translation-close-btn" onClick={handleClose} />
        <div className="translation-header">
          <span>{t("translation_editor.current_text")}</span>
        </div>
        <div className="translation-header">
          <span>{t("translation_editor.next_text")}</span>
        </div>
        <div className="translation-list custom-scrollbar">
          {translations.map((item) => (
            <BlmTranslationItem key={item.id} data={item} onChange={handleChange} />
          ))}
        </div>
        <div className="translation-btn-wrapper">
          <div className="translation-save-btn" onClick={handleSave}>
            {t("button.save")}
          </div>
          <div className="translation-cancel-btn" onClick={handleClose}>
            {t("button.cancel")}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default BlmTranslationEditor;
