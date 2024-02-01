import React, { MouseEvent, useState } from "react";
import { Drawer } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { RepeaterComponent } from "types";
import { toNumber } from "utils";
import { BlmNumericInput, NumericInputChangeEvent } from "shared";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  data: RepeaterComponent;
  onSave?: (data: RepeaterComponent) => void;
  onClose?: (event: MouseEvent) => void;
}

function BlmRepeaterOptionsEditor(props: CompProps) {
  const { data, onSave, onClose, openConfirmDialog } = props;
  const [state, setState] = useState({ repeater: data, isEdited: false });
  const { repeater, isEdited } = state;
  const { options, variables } = repeater;
  const { t } = useTranslation("content-editor");

  const saveChanges = () => {
    if (onSave) {
      onSave(repeater);
    }
  };

  const updateChange = (newRepeater: RepeaterComponent) => {
    setState({ repeater: newRepeater, isEdited: true });
  };

  const handleChange = (event: NumericInputChangeEvent) => {
    const target = event.target;
    const { name, value } = target;

    const newRepeater = {
      ...repeater,
      variables: { ...repeater.variables, [name]: value.toString() },
    };

    updateChange(newRepeater);
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

  const renderItems = () => {
    if (options) {
      return Object.values(options).map((option) => {
        const { label, css_variable, min, max } = option;
        const value = toNumber(variables?.[css_variable] as string);

        if (value !== undefined) {
          return (
            <div key={css_variable} className="repeater-option-item-wrapper">
              <div className="repeater-option-item-lbl">{label}</div>
              <BlmNumericInput
                name={css_variable}
                value={value}
                min={min}
                max={max}
                className="repeater-option-item-txt"
                onChange={handleChange}
              />
            </div>
          );
        }

        return undefined;
      });
    }
  };

  return (
    <Drawer className="repeater-options-editor-drawer" open={true} onClose={handleDrawerClose}>
      <div className="repeater-options-editor-wrapper">
        <div className="repeater-options-header">
          <div className="repeater-options-title">{t("repeater_option.repeater_options")}</div>
          <div className="repeater-options-close-btn" onClick={handleSave} />
        </div>
        <div className="repeater-display-content">{renderItems()}</div>
      </div>
    </Drawer>
  );
}

export default BlmRepeaterOptionsEditor;
