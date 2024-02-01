import React, { MouseEvent } from "react";
import clsx from "clsx";

import { TemplateWidthTypes } from "editor-constants";
import "./styles.scss";

export interface CompProps {
  type: TemplateWidthTypes;
  isSelected?: boolean;
  onChange: (event: TemplateWidthChangeEvent) => void;
}

export interface TemplateWidthChangeEvent {
  target: {
    name: string;
    value: TemplateWidthTypes;
  };
}

function BlmTemplateWidth(props: CompProps) {
  const { type, isSelected, onChange } = props;

  const handleClick = (event: MouseEvent) => {
    if (onChange) {
      onChange({ target: { name: "type", value: type } });
    }
  };

  const getLabel = () => {
    switch (type) {
      case TemplateWidthTypes.Full:
        return "100%";
      case TemplateWidthTypes.Left:
        return "Left";
      case TemplateWidthTypes.Center:
        return "Center";
      case TemplateWidthTypes.Right:
        return "Right";
    }
  };

  return (
    <div className={clsx("template-width-container", type)} onClick={handleClick}>
      <div id={type} className={clsx("template-width-img", { selected: isSelected })} />
      <div className="template-width-lbl">{getLabel()}</div>
    </div>
  );
}

export default BlmTemplateWidth;
