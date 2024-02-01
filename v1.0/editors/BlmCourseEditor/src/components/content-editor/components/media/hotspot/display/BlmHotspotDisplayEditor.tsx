import React, { ChangeEvent, MouseEvent, useState } from "react";
import { Checkbox, Drawer, FormControlLabel } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { MediaHotspot, MediaHotspotDisplay } from "types";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  data: MediaHotspot;
  onSave?: (data: MediaHotspot) => void;
  onClose?: (event: MouseEvent) => void;
}

function BlmHotspotDisplayEditor(props: CompProps) {
  const { data, onSave, onClose, openConfirmDialog } = props;
  const [state, setState] = useState({ hotspot: data, isEdited: false });
  const { hotspot, isEdited } = state;
  const { display } = hotspot;
  const { centerImage, allowZoom, miniView } = display;
  const { t } = useTranslation("content-editor");

  const saveChanges = () => {
    if (onSave) {
      onSave(hotspot);
    }
  };

  const updateChange = (newDisplay: MediaHotspotDisplay) => {
    setState({ hotspot: { ...hotspot, display: newDisplay }, isEdited: true });
  };

  const handleChange = (event: ChangeEvent<any>) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.checked;
    const newDisplay = { ...display };

    if (name === "centerImage" || name === "allowZoom" || name === "miniView") {
      newDisplay[name] = value;
    }

    updateChange(newDisplay);
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
    <Drawer className="hotspot-display-editor-drawer" open={true} onClose={handleDrawerClose}>
      <div className="hotspot-display-editor-wrapper">
        <div className="hotspot-display-header">
          <div className="hotspot-display-title">{t("hotspot.pan_zoom_opt")}</div>
          <div className="hotspot-display-close-btn" onClick={handleClose} />
        </div>
        <div className="hotspot-display-content">
          <FormControlLabel
            name="centerImage"
            label={t("hotspot.click_hotspot")}
            control={<Checkbox className="checkbox-2" />}
            checked={centerImage}
            className="hotspot-display-frm-lbl"
            onChange={handleChange}
          />
          <FormControlLabel
            name="allowZoom"
            label={t("hotspot.allow_zoom")}
            control={<Checkbox className="checkbox-2" />}
            checked={allowZoom}
            className="hotspot-display-frm-lbl"
            onChange={handleChange}
          />
          <FormControlLabel
            name="miniView"
            label={t("hotspot.mini_view")}
            control={<Checkbox className="checkbox-2" />}
            checked={miniView}
            className="hotspot-display-frm-lbl"
            onChange={handleChange}
          />
        </div>
        <div className="hotspot-display-footer">
          <div className="hotspot-display-save-btn" onClick={handleSave}>
            {t("button.save")}
          </div>
          <div className="hotspot-display-cancel-btn" onClick={handleClose}>
            {t("button.cancel")}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default BlmHotspotDisplayEditor;
