import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, PopoverAction } from "types";
import BlmPopoverActionEditor from "./editor";
import "./styles.scss";

export interface CompProps {
  data?: PopoverAction;
  onChange?: (event: CustomChangeEvent<PopoverAction>) => void;
  onApplyStyle?: (event: CustomChangeEvent<string>) => void;
}

function BlmPopoverAction(props: CompProps) {
  const { data, onChange, onApplyStyle } = props;
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const updateChange = (newData: PopoverAction) => {
    if (onChange) {
      onChange({ target: { name: "popover", value: newData } });
    }
  };

  const handleEditClick = () => {
    setOpen(true);
  };

  const handleSave = (newData: PopoverAction) => {
    updateChange(newData);
  };

  const handleApplyStyle = (style: string) => {
    if (onApplyStyle) {
      onApplyStyle({ target: { name: "popover", value: style } });
    }
  };

  const hanldeClose = () => {
    setOpen(false);
  };

  return (
    <div className="popover-action-wrapper">
      <div className="popover-action-edit-btn" onClick={handleEditClick}>
        {t("button.edit")}
      </div>
      {open && (
        <BlmPopoverActionEditor
          data={data}
          onSave={handleSave}
          onApplyStyle={handleApplyStyle}
          onClose={hanldeClose}
        />
      )}
    </div>
  );
}

export default BlmPopoverAction;
