import React from "react";
import clsx from "clsx";

import { CustomChangeEvent, Tint } from "types";
import BlmColorPicker, { ColorPickerColor, SwatchColors } from "../color-picker";
import BlmAlphaPicker from "../alpha-picker";
import "./tint-picker.scss";

export type TintPickerChangeEvent = CustomChangeEvent<Tint>;

export interface CompProps {
  title?: string;
  subTitle?: string;
  name?: string;
  data?: Tint;
  defaultTint?: Tint;
  colors?: SwatchColors;
  className?: string;
  outOver?: string;
  onChange?: (event: TintPickerChangeEvent) => void;
}

function BlmTintPicker(props: CompProps) {
  const {
    title,
    subTitle,
    name = "tint",
    data,
    defaultTint,
    colors,
    className,
    outOver,
    onChange,
  } = props;
  const { color = defaultTint?.color, alpha = defaultTint?.alpha ?? 100 } = data || {};

  const updateChange = (value: Tint) => {
    if (onChange) {
      onChange({ target: { name, value } });
    }
  };

  const handleChange = (event: CustomChangeEvent<ColorPickerColor | number | undefined>) => {
    const { name, value } = event.target;
    const newData: Tint = { ...data, color, alpha };

    if (name === "color" && value) {
      newData.color = (value as ColorPickerColor).color;
      newData.alpha = (value as ColorPickerColor).alpha ?? alpha;
    } else if (name === "alpha") {
      newData.alpha = value as number;
    }

    updateChange(newData);
  };

  return (
    <div className={clsx("tint-picker-wrapper", className)}>
      {outOver && <span className="tint-picker-out">{outOver}</span>}
      {title && <span className="tint-picker-title">{title}</span>}
      <BlmColorPicker color={color} colors={colors} onChange={handleChange} />
      {subTitle && <span className="tint-picker-sub-title">{subTitle}</span>}
      <BlmAlphaPicker alpha={alpha} onChange={handleChange} />
    </div>
  );
}

export default BlmTintPicker;
