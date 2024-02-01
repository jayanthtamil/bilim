import React from "react";
import clsx from "clsx";
import { CustomPicker, CustomPickerInjectedProps, RenderersProps } from "react-color";
import { Saturation, Hue, Checkboard } from "react-color/lib/components/common";

import { SwatchColor, SwatchColors } from "../BlmColorPicker";
import BlmCustomPointer from "./BlmCustomPointer";
import BlmCustomFields from "./BlmCustomFields";
import BlmCustomPointerCircle from "./BlmCustomPointerCircle";
import BlmCustomPresetColors from "./BlmCustomPresetColors";

export interface CompProps extends RenderersProps {
  colors?: SwatchColors;
  hideClear?: boolean;
  defaultView?: "hex" | "rgb" | "hsl";
  className?: string;
  onClearClick?: () => void;
  onSwatchClick?: (value: SwatchColor) => void;
}

function BlmCustomPicker(props: CompProps & CustomPickerInjectedProps) {
  const {
    colors,
    rgb,
    hsl,
    hsv,
    hex,
    renderers,
    hideClear,
    defaultView,
    className,
    onChange,
    onClearClick,
    onSwatchClick,
  } = props;
  const styles: any = {
    picker: {
      width: 225,
      background: "#fff",
      borderRadius: "2px",
      boxShadow: "0 0 2px rgba(0,0,0,.3), 0 4px 8px rgba(0,0,0,.3)",
      boxSizing: "initial",
      fontFamily: "Menlo",
    },
    saturation: {
      width: "100%",
      paddingBottom: colors?.length ? "40%" : "55%",
      position: "relative",
      borderRadius: "2px 2px 0 0",
      overflow: "hidden",
    },
    Saturation: {
      radius: "2px 2px 0 0",
    },
    body: {
      padding: "16px 16px 12px",
    },
    controls: {
      display: "flex",
    },
    color: {
      display: "flex",
      gap: "12px",
      margin: "0 12px 0 0",
    },
    clear: {
      display: hideClear ? "none" : "block",
      width: "15px",
      height: "15px",
      transform: "translate(0, -2px)",
      border: "1px solid #dadada",
      borderRadius: "3px",
      background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'><line x1='0' y1='100' x2='100' y2='0' stroke='%23d92306' stroke-width='2' vector-effect='non-scaling-stroke'/></svg>")
        no-repeat center #f1f5fe`,
      backgroundSize: "100% 100% auto",
    },
    swatch: {
      marginTop: "0px",
      width: "10px",
      height: "10px",
      borderRadius: "8px",
      position: "relative",
      overflow: "hidden",
    },
    active: {
      position: "absolute",
      inset: "0",
      borderRadius: "8px",
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)",
      background: `rgba(${rgb!.r}, ${rgb!.g}, ${rgb!.b}, ${rgb!.a})`,
      zIndex: "2",
    },
    toggles: {
      flex: "1",
    },
    hue: {
      height: "10px",
      position: "relative",
      marginBottom: "0px",
    },
    Hue: {
      radius: "2px",
    },
  };

  return (
    <div style={styles.picker} className={clsx("chrome-picker", className)}>
      <BlmCustomPresetColors colors={colors} onClick={onSwatchClick} />
      <div style={styles.saturation}>
        <Saturation hsl={hsl} hsv={hsv} pointer={BlmCustomPointerCircle} onChange={onChange} />
      </div>
      <div style={styles.body}>
        <div style={styles.controls} className="flexbox-fix">
          <div style={styles.color}>
            <div style={styles.clear} onClick={onClearClick} />
            <div style={styles.swatch}>
              <div style={styles.active} />
              <Checkboard renderers={renderers} />
            </div>
          </div>
          <div style={styles.toggles}>
            <div style={styles.hue}>
              <Hue hsl={hsl} pointer={BlmCustomPointer} onChange={onChange} />
            </div>
          </div>
        </div>
        <BlmCustomFields rgb={rgb!} hsl={hsl!} hex={hex!} view={defaultView} onChange={onChange} />
      </div>
    </div>
  );
}

export default CustomPicker(BlmCustomPicker);
