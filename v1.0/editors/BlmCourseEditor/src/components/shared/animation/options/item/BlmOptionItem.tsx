import React, { ChangeEvent, FocusEvent, Fragment } from "react";
import clsx from "clsx";
import { Checkbox, FormControlLabel, MenuItem, Select } from "@material-ui/core";

import { AnimationOption } from "types";
import "./styles.scss";

export interface CompProps {
  name: string;
  data: AnimationOption;
  onChange?: (name: string, data: AnimationOption) => void;
}

function BlmOptionsItem(props: CompProps) {
  const { name, data, onChange } = props;
  const { name: label, type, value, min, max, list_values } = data;

  const updateChange = (newValue: string | number | boolean) => {
    const newData = { ...data, value: newValue };

    if (onChange) {
      onChange(name, newData);
    }
  };

  const getRegEx = () => {
    if (type === "integer") {
      return /^\d+$/;
    } else if (type === "number") {
      return /^\d*(\.\d*)?$/;
    } else {
      return /(?:)/;
    }
  };

  const handleChange = (event: ChangeEvent<any>) => {
    const { name, value, checked } = event.target;

    if (name === "checkbox") {
      updateChange(checked);
    } else if (value === "" || getRegEx().test(value)) {
      updateChange(value);
    }
  };

  const handleBlurChange = (event: FocusEvent<HTMLInputElement>) => {
    let newValue = event.target.value;

    if (type !== "string" && newValue !== "") {
      if (min !== undefined) {
        newValue = Math.max(min, Number(newValue)).toString();
      }
      if (max !== undefined) {
        newValue = Math.min(max, Number(newValue)).toString();
      }
      if (newValue !== value) {
        updateChange(newValue);
      }
    }
  };

  const renderChild = () => {
    if (type === "string" || type === "number" || type === "integer") {
      return (
        <Fragment>
          <div className="option-item-lbl">{label}</div>
          <input
            type="text"
            value={value as string}
            className="option-item-txt"
            onChange={handleChange}
            onBlur={handleBlurChange}
          />
        </Fragment>
      );
    } else if (type === "list") {
      const arr = list_values ? list_values.split("|") : [];
      return (
        <Fragment>
          <div className="option-item-lbl">{label}</div>
          <Select
            value={value as string}
            className="option-item-dropdown"
            onChange={handleChange}
            onBlur={handleBlurChange}
          >
            {arr.map((item, ind) => (
              <MenuItem key={ind} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </Fragment>
      );
    } else if (type === "boolean") {
      return (
        <FormControlLabel
          name="checkbox"
          label={label}
          control={<Checkbox />}
          checked={value as boolean}
          className="option-item-frm-ctrl"
          onChange={handleChange}
        />
      );
    }
  };

  return <div className={clsx("option-item-wrapper", type)}>{renderChild()}</div>;
}

export default BlmOptionsItem;
