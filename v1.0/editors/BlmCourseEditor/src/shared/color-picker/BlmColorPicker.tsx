import React, { useState, MouseEvent, useRef, HTMLAttributes, Fragment } from "react";
import clsx from "clsx";
import { ColorState } from "react-color";
import { Backdrop, Popper } from "@material-ui/core";

import { CustomChangeEvent } from "types";
import BlmCustomPicker from "./custom-picker";
import "./color-picker.scss";

export type SwatchColor = string | { name?: string; color: string; alpha?: number };
export type SwatchColors = Array<SwatchColor>;
export type ColorPickerColor = { color?: string; alpha?: number };
export type ColorPickerChangeEvent = CustomChangeEvent<ColorPickerColor>;

export interface CompProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "onMouseDown"> {
  name?: string;
  color?: string;
  colors?: SwatchColors;
  hideClear?: boolean;
  className?: string;
  onChange?: (event: ColorPickerChangeEvent) => void;
}

const popperOptions = {
  positionFixed: true,
};

const modifiers = {
  flip: {
    enabled: true,
  },
  keepTogether: {
    enabled: false,
  },
  arrow: {
    enabled: false,
  },
  preventOverflow: {
    enabled: false,
  },
  hide: {
    enabled: false,
  },
  computeStyle: {
    gpuAcceleration: false,
  },
};

function BlmColorPicker(props: CompProps) {
  const {
    name = "color",
    color,
    colors,
    hideClear = false,
    className,
    onChange,
    ...others
  } = props;
  const [showPicker, setShowPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>();
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const prevColor = selectedColor || color;

  const updateChange = (newColor?: string, newAlpha?: number) => {
    setSelectedColor(undefined);

    if (onChange) {
      onChange({
        target: { name, value: { color: newColor, alpha: newAlpha } },
      });
    }
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    setShowPicker(true);
  };

  const handleBackdropClick = (event: MouseEvent) => {
    setShowPicker(false);

    if (selectedColor && color !== selectedColor) {
      updateChange(selectedColor);
    }
  };

  const handleColorChange = (color: ColorState) => {
    setSelectedColor(color.hex);
  };

  const handleClearClick = () => {
    setShowPicker(false);
    updateChange();
  };

  const handleSwatchClick = (swatch: SwatchColor) => {
    const [newColor, newAlpha] =
      typeof swatch === "string" ? [swatch, 100] : [swatch.color, swatch.alpha ?? 100];

    setShowPicker(false);
    updateChange(newColor, newAlpha);
  };

  return (
    <div
      ref={anchorRef}
      className={clsx("color-picker-wrapper", className, {
        "has-color": color,
        "has-preview-color": prevColor,
        "show-picker": showPicker,
      })}
      onMouseDown={handleMouseDown}
      {...others}
    >
      <div className="color-picker-preview" style={{ backgroundColor: prevColor }} />
      {showPicker && (
        <Fragment>
          <Backdrop open={true} className="color-picker-backdrop" onClick={handleBackdropClick} />
          <Popper
            id="color-picker"
            open={showPicker}
            anchorEl={anchorRef.current}
            disablePortal={true}
            placement="bottom-start"
            popperOptions={popperOptions}
            modifiers={modifiers}
            className="color-picker-popper"
          >
            <div className="sp-color-picker-box">
              <BlmCustomPicker
                color={prevColor}
                colors={colors}
                hideClear={hideClear}
                className="color-picker"
                onChange={handleColorChange}
                onClearClick={handleClearClick}
                onSwatchClick={handleSwatchClick}
              />
            </div>
          </Popper>
        </Fragment>
      )}
    </div>
  );
}

export default BlmColorPicker;
