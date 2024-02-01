import React, { ChangeEvent, useMemo } from "react";
import { Select, MenuItem } from "@material-ui/core";

import { GotoAction, CustomChangeEvent, Goto360Action } from "types";
import { isMediaComponent, isMediaHotspot360 } from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import { useHotspot360Context } from "../../media/hotspot/360";
import "./styles.scss";

export interface CompProps {
  data?: Goto360Action;
  onChange?: (event: CustomChangeEvent<Goto360Action>) => void;
}

function BlmGoto360Action(props: CompProps) {
  const { data, onChange } = props;
  const { component } = useContentEditorCtx();
  const { selectedId } = useHotspot360Context();
  const { gotoId } = data || {};

  const items = useMemo(() => {
    if (component && isMediaComponent(component) && isMediaHotspot360(component)) {
      const { items } = component.value;

      return items.filter((item) => item.id !== selectedId);
    }

    return [];
  }, [selectedId, component]);

  const updateChange = (newData: GotoAction) => {
    if (onChange) {
      onChange({ target: { name: "goto360", value: newData } });
    }
  };

  const handleChange = (event: ChangeEvent<any> | CustomChangeEvent<string>) => {
    const { name, value } = event.target;
    const newData = { gotoId };

    if (name === "gotoId") {
      newData.gotoId = value;
    }

    updateChange(newData);
  };

  const renderPlaceholder = () => {
    return <div>Select 360</div>;
  };

  return (
    <div className="goto-360-action-wrapper">
      <Select
        name="gotoId"
        value={gotoId || ""}
        displayEmpty={true}
        disabled={items.length === 0}
        renderValue={gotoId ? undefined : renderPlaceholder}
        MenuProps={{
          className: "goto-360-actions-dropdown-popover",
        }}
        className="goto-360-actions-dropdown"
        onChange={handleChange}
      >
        {items.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

export default BlmGoto360Action;
