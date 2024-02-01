import React from "react";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MediaLayerAction } from "types";
import { AcceptedFileTypes } from "editor-constants";
import { BlmMediaPicker, MediaPickerChangeEvent } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import "./styles.scss";

export interface CompProps {
  data?: MediaLayerAction;
  onChange?: (event: CustomChangeEvent<MediaLayerAction>) => void;
}

function BlmMediaLayerAction(props: CompProps) {
  const { data, onChange } = props;
  const { element } = useContentEditorCtx();
  const { layer } = data || {};
  const { t } = useTranslation("content-editor");

  const updateChange = (newData: MediaLayerAction) => {
    if (onChange) {
      onChange({ target: { name: "mediaLayer", value: newData } });
    }
  };

  const handleChange = (event: MediaPickerChangeEvent) => {
    const { value } = event.target;
    const newData = { layer: value };

    updateChange(newData);
  };

  return (
    <div className="media-layer-action-wrapper">
      <BlmMediaPicker
        name="media"
        elementId={element!.id}
        acceptedFiles={[AcceptedFileTypes.Image, AcceptedFileTypes.Video]}
        data={layer}
        placeholder="Select media"
        className="media-layer-picker"
        onChange={handleChange}
      />
      <div className="media-layer-info-lbl">{t("media_layer.layer_info")}</div>
    </div>
  );
}
export default BlmMediaLayerAction;
