import { Checkbox, FormControlLabel, Modal } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { MediaComponent, MediaConfigOptions, MediaHotspot360 } from "types";
import "./styles.scss";

export interface Hotspot360Option {
  open: boolean;
  data: MediaComponent & { value: MediaHotspot360 };
  onSave: () => void;
  onClose: () => void;
  onChange: (newValue: MediaConfigOptions) => void;
}

const BlmHotspot360Options = (props: Hotspot360Option) => {
  const { t } = useTranslation("shared");
  const { open, onSave, onClose, data, onChange } = props;

  const handleSave = () => {
    onSave();
  };

  const handleClose = () => {
    onClose();
  };

  const handleOptionClick = (option: string, value: string) => {
    let newMediaOptions: MediaConfigOptions = {} as MediaConfigOptions;
    if (data.options2) {
      newMediaOptions = { ...data.options2 };
    }
    switch (option) {
      case "Vertical":
        newMediaOptions.vertical = value;
        break;
      case "Horizontal":
        newMediaOptions.horizontal = value;
        break;
      case "Zoom":
        newMediaOptions.zoom = value === "true" ? true : false;
        break;
    }
    onChange(newMediaOptions);
  };

  return (
    <Modal open={open} className="hotspot360_options-editor-modal">
      <div className="hotspot360_options-editor-wrapper">
        <div className="hotspot360_options-title">
          <div style={{ position: "relative", top: "15px" }}>{t("title.option360")}</div>
          <div className="options-modal-close-btn" onClick={handleClose} />
        </div>

        <div
          style={{
            display: "flex",
            flexFlow: "column",
            gap: "10px",
            gridColumn: "1/-1",
            margin: "25px 50px 0px 50px",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "25px" }}>
            {t("hotspot360.chooseDirection")}
          </div>
          <div style={{ fontWeight: "bold" }}>{t("hotspot360.alignHorizontal")}</div>
          <div
            style={{
              display: "flex",
              flexFlow: "row",
              gap: "20px",
              justifyContent: "space-around",
            }}
          >
            <div
              className={`options-horizontal-lock ${
                data.options2?.horizontal === "lock" ? "option-selected" : ""
              }`}
              onClick={() => handleOptionClick("Horizontal", "lock")}
            />
            <div
              className={`options-horizontal-half ${
                data.options2?.horizontal === "half" ? "option-selected" : ""
              }`}
              onClick={() => handleOptionClick("Horizontal", "half")}
            />
            <div
              className={`options-horizontal-full ${
                data.options2?.horizontal === "full" ? "option-selected" : ""
              }`}
              onClick={() => handleOptionClick("Horizontal", "full")}
            />
          </div>
          <div style={{ fontWeight: "bold" }}>{t("hotspot360.alignVertical")}</div>
          <div
            style={{
              display: "flex",
              flexFlow: "row",
              gap: "20px",
              justifyContent: "space-around",
            }}
          >
            <div
              className={`options-vertical-lock ${
                data.options2?.vertical === "lock" ? "option-selected" : ""
              }`}
              onClick={() => handleOptionClick("Vertical", "lock")}
            />
            <div
              className={`options-vertical-half ${
                data.options2?.vertical === "half" ? "option-selected" : ""
              }`}
              onClick={() => handleOptionClick("Vertical", "half")}
            />
            <div
              className={`options-vertical-full ${
                data.options2?.vertical === "full" ? "option-selected" : ""
              }`}
              onClick={() => handleOptionClick("Vertical", "full")}
            />
          </div>
          <div>
            <FormControlLabel
              name="allowZoom"
              label={t("hotspot360.allowZoom")}
              control={<Checkbox className="checkBox" />}
              checked={data.options2?.zoom}
              className="hotspot360_option-chk-frm-ctrl"
              onChange={() => handleOptionClick("Zoom", (!data.options2?.zoom).toString())}
            />
          </div>
        </div>
        <div className="hotspot360_options-save-btn" onClick={handleSave}>
          {t("button.save")}
        </div>
        <div className="hotspot360_options-cancel-btn" onClick={handleClose}>
          {t("button.cancel")}
        </div>
      </div>
    </Modal>
  );
};

export default BlmHotspot360Options;
