import React, { MouseEvent, useMemo, useRef } from "react";
import clsx from "clsx";

import { SimpleObject, TextComponent } from "types";
import { camelToKebab } from "utils";
import { BlmRichTextEditor, TextEditorChangeEvent } from "components/component-editor";
import { useTextComponentEditorStyle } from "./styles";

const cssProperties = [
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "color",
  "textDecoration",
  "textTransform",
  "backgroundColor",
];

export interface CompProps {
  data: TextComponent;
  isDark: boolean;
  onChange: (data: TextComponent) => void;
}

function BlmTextComponentEditor(props: CompProps) {
  const { data, isDark, onChange } = props;
  const { value, frameStyle, isDeactivated } = data;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const classes = useTextComponentEditorStyle();

  const style = useMemo(() => {
    const styles: SimpleObject = {};

    if (frameStyle) {
      for (const prop of cssProperties) {
        let val = frameStyle.getPropertyValue(camelToKebab(prop));

        styles[prop] = val;
      }
    }

    return styles;
  }, [frameStyle]);

  const updateChange = (newData: TextComponent) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (event: TextEditorChangeEvent) => {
    const newData = { ...data, value: event.target.value };

    updateChange(newData);
  };

  const handleActivateClick = (event: MouseEvent) => {
    const newData = { ...data, isDeactivated: false };

    updateChange(newData);
  };

  const handleDeactivateClick = (event: MouseEvent) => {
    const newData = { ...data, isDeactivated: true };

    updateChange(newData);
  };

  return (
    <div
      ref={containerRef}
      className={clsx(classes.root, {
        [classes.dark]: isDark,
        [classes.deactivated]: isDeactivated,
      })}
    >
      <div style={style} className={classes.editorWrapper}>
        <BlmRichTextEditor
          name="text"
          value={value}
          offset={{ x: -15, y: -15 }}
          onChange={handleChange}
        />
      </div>
      {isDeactivated && <div className={classes.activateBtn} onClick={handleActivateClick} />}
      {!isDeactivated && <div className={classes.deactivateBtn} onClick={handleDeactivateClick} />}
    </div>
  );
}

export default BlmTextComponentEditor;
