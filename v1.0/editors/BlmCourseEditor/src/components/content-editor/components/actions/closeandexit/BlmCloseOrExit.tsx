import React, { ChangeEvent, useMemo } from "react";
import { CloseOrExitAction, CustomChangeEvent } from "types";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import { CloseOrExitTypes } from "editor-constants";
import { Divider, ListItemText, MenuItem, Select } from "@material-ui/core";

export interface CompProps {
  data?: CloseOrExitAction;
  onChange?: (event: CustomChangeEvent<CloseOrExitAction>) => void;
}

const BlmCloseOrExit = (props: CompProps) => {
  const { data, onChange } = props;
  const { action, option } = data || {};
  const { t } = useTranslation("content-editor");

  const items = useMemo(() => {
    const result = [];

    result.push(
      "CLOSE",
      { label: t("close_or_exit.close_pop_up"), type: CloseOrExitTypes.ClosePopup },
      { label: t("close_or_exit.close_flap"), type: CloseOrExitTypes.CloseFlap },
      { label: t("close_or_exit.close_below"), type: CloseOrExitTypes.CloseBelow }
    );

    result.push("divider", "EXIT", {
      label: t("close_or_exit.exit_course"),
      type: CloseOrExitTypes.ExitCourse,
    });

    return result;
  }, [t]);

  const updateChange = (newData: CloseOrExitAction) => {
    if (onChange) {
      onChange({ target: { name: "closeexit", value: newData } });
    }
  };

  const renderPlaceholder = () => {
    return <div>Select Action</div>;
  };

  const handleChange = (event: ChangeEvent<any> | CustomChangeEvent<string>) => {
    const { name, value } = event.target;
    const newData = { action: value, option };

    if (name === "action") {
      newData.option = value;
    }

    updateChange(newData);
  };

  const renderItems = () => {
    if (items) {
      return items.map((item, ind) => {
        if (typeof item === "object") {
          const { type, label } = item;
          return (
            <MenuItem key={type} value={type}>
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          );
        } else if (item === "divider") {
          return <Divider key={item + ind} />;
        } else {
          return (
            <div key={item} className="closeorexit-dropdown-menu-title">
              {item}
            </div>
          );
        }
      });
    }
  };

  return (
    <div className="closeorexit-action-wrapper">
      <Select
        name="action"
        value={action || ""}
        displayEmpty={true}
        MenuProps={{
          className: "closeorexit-actions-dropdown-popover",
        }}
        className="closeorexit-actions-dropdown"
        renderValue={action ? undefined : renderPlaceholder}
        onChange={handleChange}
      >
        {renderItems()}
      </Select>
    </div>
  );
};

export default BlmCloseOrExit;
