import React, { MouseEvent, useState } from "react";
import { Modal } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { AnimationOption, AnimationOptions } from "types";
import BlmOptionItem from "./item";
import "./styles.scss";

export interface CompProps {
  open: boolean;
  data: AnimationOptions;
  onSave?: (data: AnimationOptions) => void;
  onClose?: (event: MouseEvent) => void;
}

function BlmOptionsEditor(props: CompProps) {
  const { open, data, onSave, onClose } = props;
  const [state, setState] = useState({ options: data, isEdited: false });
  const { options, isEdited } = state;
  const { t } = useTranslation("shared");

  const saveChanges = () => {
    if (onSave) {
      onSave(options);
    }
  };

  const handleChange = (name: string, option: AnimationOption) => {
    const newData = { ...options };

    newData[name] = option;

    setState({ options: newData, isEdited: true });
  };

  const handleSave = (event: MouseEvent) => {
    if (isEdited) {
      saveChanges();
    }

    handleClose(event);
  };

  const handleClose = (event: MouseEvent) => {
    if (onClose) {
      onClose(event);
    }
  };

  const renderItems = () => {
    return Object.keys(options).map((key, ind) => {
      const option = options[key];

      return <BlmOptionItem key={ind} name={key} data={option} onChange={handleChange} />;
    });
  };

  return (
    <Modal open={open} className="options-editor-modal">
      <div className="options-editor-wrapper">
        <div className="options-title">{t("title.option")}</div>
        {renderItems()}
        <div className="options-save-btn" onClick={handleSave}>
          {t("button.save")}
        </div>
        <div className="options-cancel-btn" onClick={handleClose}>
          {t("button.cancel")}
        </div>
      </div>
    </Modal>
  );
}

export default BlmOptionsEditor;
