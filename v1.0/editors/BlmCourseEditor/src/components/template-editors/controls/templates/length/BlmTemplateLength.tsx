import React, { ChangeEvent } from "react";
import clsx from "clsx";
import { Switch } from "@material-ui/core";

import { TemplateLength } from "types";
import "./styles.scss";

export interface CompProps {
  type: "top" | "middle" | "bottom";
  name: string;
  data: TemplateLength;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  title?: string;
  label?: string;
  switchLeft?: string;
  switchRight?: string;
  className?: string;
  onChange?: (event: TemplateLengthChangeEvent) => void;
  selected: boolean;
  values: string;
  paddingTop?: TemplateLength;
}

export interface TemplateLengthChangeEvent {
  target: {
    name: string;
    value: TemplateLength;
  };
}

function BlmTemplateLength(props: CompProps) {
  const {
    type,
    name,
    data,
    min,
    max,
    allowNegative = false,
    title,
    label,
    switchLeft,
    switchRight,
    className,
    onChange,
    selected,
    values,
    paddingTop,
  } = props;

  if (paddingTop) {
    var { value: Pvalue } = paddingTop;
  }
  const updateChange = (newData: TemplateLength) => {
    if (onChange) {
      onChange({ target: { name, value: newData } });
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name: txtName, value: txtValue, checked } = event.target;
    var test = false;
    const newData: any = { ...data, test };

    if (txtName === "switch") {
      newData.isSelected = checked;
      if (checked === true && Pvalue) {
        newData.value = Pvalue;
      }
      newData.test = true;
    } else {
      const newStr = txtValue.trim();
      let newNum = parseInt(newStr, 10);

      if (!allowNegative) {
        newNum = Math.abs(newNum);
      }

      if (allowNegative && newStr === "-") {
        newData.value = newStr.toString();
      } else if (newStr !== "" && !isNaN(newNum)) {
        if (min !== undefined) {
          newNum = Math.max(min, newNum);
        }
        if (max !== undefined) {
          newNum = Math.min(max, newNum);
        }
        newData.value = newNum.toString();
      } else {
        newData.value = "";
      }
    }

    updateChange(newData);
  };

  return (
    <div className={clsx("template-length-wrapper", type, className)}>
      {title !== "TemplateShift" && <div className="template-length-title">{title}</div>}
      <div className="template-length-txt-ctrl">
        {title === "TemplateShift" && (
          <div>
            <div className="icon-1" />
            <div className="icon-2" />
          </div>
        )}

        <input value={values} onChange={handleChange} />
        <span>{label}</span>
      </div>
      {title !== "TemplateShift" && title !== "top" && title !== "bottom" && (
        <div className="template-length-switch-ctrl">
          <span>{switchLeft}</span>
          <Switch name="switch" checked={selected} className="switch-1" onChange={handleChange} />
          <span>{switchRight}</span>
        </div>
      )}
    </div>
  );
}

export default BlmTemplateLength;
