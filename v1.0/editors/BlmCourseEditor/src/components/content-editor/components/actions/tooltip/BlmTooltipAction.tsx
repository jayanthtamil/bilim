import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, TooltipAction } from "types";
import { ComponentActionTypes, StyleListTypes } from "editor-constants";
import {
  getHotspotActions,
  hasSameActionStyles,
  isMediaComponent,
  isMediaHotspot,
  isMediaHotspot360,
} from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import { useHotspot360Context } from "../../media/hotspot/360";
import { BlmStylePicker } from "../../styles";
import "./styles.scss";

export interface CompProps {
  data?: TooltipAction;
  onChange?: (event: CustomChangeEvent<TooltipAction>) => void;
  onApplyStyle?: (event: CustomChangeEvent<string>) => void;
}

function BlmTooltipAction(props: CompProps) {
  const { data, onChange, onApplyStyle } = props;
  const { component } = useContentEditorCtx();
  const { selectedId } = useHotspot360Context();
  const { label = "", style } = data || {};
  const { t } = useTranslation("content-editor");

  const hotspot = useMemo(() => {
    if (component && isMediaComponent(component)) {
      if (isMediaHotspot(component)) {
        return component.value;
      } else if (selectedId && isMediaHotspot360(component)) {
        return component.value.items.find((item) => item.id === selectedId);
      }
    }
  }, [component, selectedId]);

  const actions = useMemo(() => {
    return (
      (hotspot && getHotspotActions<TooltipAction>(hotspot, ComponentActionTypes.Tooltip)) ?? []
    );
  }, [hotspot]);

  const showApplyIcon = useMemo(() => {
    return Boolean(style && hasSameActionStyles(actions, style));
  }, [actions, style]);

  const updateChange = (newData: TooltipAction) => {
    if (onChange) {
      onChange({ target: { name: "tooltip", value: newData } });
    }
  };

  const handleChange = (event: CustomChangeEvent<string>) => {
    const { name, value } = event.target;
    const newData = { ...data, [name]: value };

    updateChange(newData);
  };

  const handleApplyClick = (style: string) => {
    if (onApplyStyle) {
      onApplyStyle({ target: { name: "tooltip", value: style } });
    }
  };

  return (
    <div className="tooltip-action-wrapper">
      <input
        name="label"
        type="text"
        value={label}
        placeholder={t("hotspot.tooltip_label")}
        className="tooltip-action-label-txt"
        onChange={handleChange}
      />
      <BlmStylePicker
        type={StyleListTypes.MediaHotspotTooltip}
        name="style"
        label={t("hotspot.apply_tooltip")}
        value={style}
        showApplyIcon={showApplyIcon}
        onChange={handleChange}
        onApplyClick={handleApplyClick}
      />
    </div>
  );
}
export default BlmTooltipAction;
