import React, { ChangeEvent, Fragment, useState } from "react";
import clsx from "clsx";
import { Checkbox, MenuItem, Select } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { MediaHotspot } from "types";
import { HotspotDisplayTypes } from "editor-constants";
import BlmHotspotGroupsEditor from "../group";
import BlmHotspotsEditor from "../list";
import BlmHotspotDisplayEditor from "../display";
import { changeKeyMap } from "./utils";
import "./styles.scss";

export interface HotspotHeaderProps {
  type?: "standard" | "panorama";
  data: MediaHotspot;
  onChange?: (data: MediaHotspot) => void;
}

interface EditorPanelState {
  open: boolean;
  type: "none" | "group" | "order" | "display";
}

const initEditorPanel: EditorPanelState = {
  open: false,
  type: "none",
};

function BlmHotspotHeader(props: HotspotHeaderProps) {
  const { type = "standard", data, onChange } = props;
  const { groups, display, items } = data;
  const [editorPanel, setEditorPanel] = useState(initEditorPanel);
  const { t } = useTranslation("content-editor");

  const updateChange = (newData: MediaHotspot) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const toggleEditorPanel = (open: boolean, type: EditorPanelState["type"] = "none") => {
    setEditorPanel({ open, type });
  };

  const handleChange = (event: ChangeEvent<any>) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.type === "checkbox" ? target.checked : target.value;
    let newHotspot: MediaHotspot | undefined;

    if (changeKeyMap.hasOwnProperty(name)) {
      const map = changeKeyMap[name];
      const { obj, key } = map;

      newHotspot = { ...data, [obj]: { ...data[obj], [key]: value } };
    }

    if (newHotspot) {
      updateChange(newHotspot);
    }
  };

  const handleGroupClick = () => {
    toggleEditorPanel(true, "group");
  };

  const handleOrderClick = () => {
    toggleEditorPanel(true, "order");
  };

  const handleDisplayClick = () => {
    toggleEditorPanel(true, "display");
  };

  const handleEditorSave = (newHotspot: MediaHotspot) => {
    updateChange(newHotspot);
  };

  const handleEditorClose = () => {
    toggleEditorPanel(false);
  };

  const renderEditorPanel = () => {
    const { open, type } = editorPanel;

    if (!open) {
      return undefined;
    } else if (type === "group") {
      return (
        <BlmHotspotGroupsEditor data={data} onSave={handleEditorSave} onClose={handleEditorClose} />
      );
    } else if (type === "order") {
      return (
        <BlmHotspotsEditor data={data} onSave={handleEditorSave} onClose={handleEditorClose} />
      );
    } else if (type === "display") {
      return (
        <BlmHotspotDisplayEditor
          data={data}
          onSave={handleEditorSave}
          onClose={handleEditorClose}
        />
      );
    }
  };

  return (
    <Fragment>
      <div className={clsx("hotspot-header-wrapper", type)}>
        <Checkbox
          name="groups_chk"
          checked={groups.enabled}
          className="checkbox-2 hotspot-header-group-chk"
          onClick={handleChange}
        />
        <span className="hotspot-header-group-lbl">{t("hotspot.enable_group")}</span>
        {groups.enabled && (
          <div className="hotspot-header-group-edit-btn" onClick={handleGroupClick}>
            {t("button.edit")}
          </div>
        )}
        {type === "standard" && (
          <Select
            name="display_type"
            value={display.type}
            className="hotspot-header-display-dropdown"
            onChange={handleChange}
          >
            <MenuItem value={HotspotDisplayTypes.Contain}>{t("list.contain")}</MenuItem>
            <MenuItem value={HotspotDisplayTypes.PanAndZoom}>{t("hotspot.pan_zoom")}</MenuItem>
          </Select>
        )}
        <span className="hotspot-header-order-lbl">{t("hotspot.hotspot_order")}</span>
        {items.length > 0 && (
          <div className="hotspot-header-group-order-btn" onClick={handleOrderClick}>
            {t("button.edit")}
          </div>
        )}
        {display.type === HotspotDisplayTypes.PanAndZoom && (
          <div className="hotspot-header-display-edit-btn" onClick={handleDisplayClick}>
            {t("button.edit")}
          </div>
        )}
      </div>
      {renderEditorPanel()}
    </Fragment>
  );
}

export default BlmHotspotHeader;
