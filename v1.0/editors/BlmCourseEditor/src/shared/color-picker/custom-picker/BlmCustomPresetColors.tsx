import React, { CSSProperties } from "react";
//@ts-ignore
import { Swatch } from "react-color/lib/components/common";

import { SwatchColor, SwatchColors } from "../BlmColorPicker";

export interface CompProps {
  colors?: SwatchColors;
  onClick?: (color: SwatchColor) => void;
}

function BlmCustomPresetColors(props: CompProps) {
  const { colors, onClick } = props;
  const styles = {
    colors: {
      position: "relative",
      display: colors?.length ? "flex" : "none",
      flexWrap: "wrap",
      margin: "0 0 10px 0",
      padding: "10px 0 0 10px",
      borderBottom: "1px solid #eee",
    },
    swatchWrap: {
      width: "16px",
      height: "16px",
      margin: "0 10px 10px 0",
    },
    swatch: {
      borderRadius: "3px",
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,.15)",
    },
  };

  return (
    <div style={styles.colors as CSSProperties} className="flexbox-fix">
      {colors?.map((item, index) => {
        const [color, name] = typeof item === "string" ? [item] : [item.color, item.name];

        return (
          <div key={index} style={styles.swatchWrap}>
            <Swatch
              color={color}
              title={name}
              style={styles.swatch}
              focusStyle={{
                boxShadow: `inset 0 0 0 1px rgba(0,0,0,.15), 0 0 4px ${color}`,
              }}
              onClick={() => onClick && onClick(item)}
            />
          </div>
        );
      })}
    </div>
  );
}

export default BlmCustomPresetColors;
