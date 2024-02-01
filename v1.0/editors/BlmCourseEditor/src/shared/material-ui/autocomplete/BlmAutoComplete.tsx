import React, { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import clsx from "clsx";
import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";

import { CustomChangeEvent } from "types";
import { DropdownImg } from "assets/icons";
import { toNumber } from "utils";
import "./styles.scss";

export interface CompProps {
  name?: string;
  value?: number;
  options: string[];
  suffix?: string;
  min?: number;
  max?: number;
  className?: string;
  onChange?: (event: AutoCompleteChangeEvent) => void;
}

export type AutoCompleteChangeEvent = CustomChangeEvent<number | undefined>;

function formatValue(value?: number, suffix = "") {
  return value !== undefined ? value.toString() + suffix : "";
}

function BlmAutoComplete(props: CompProps) {
  const { name = "autocomplete", value, options, suffix, min, max, className, onChange } = props;
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(formatValue(value, suffix));
  }, [value, suffix]);

  const updateChange = (newInput: string) => {
    let newValue: number | undefined = toNumber(newInput);

    if (!isNaN(newValue)) {
      newValue = Math.min(Math.max(newValue, min || -Infinity), max || Infinity);
    } else {
      newValue = min;
    }

    setInputValue(formatValue(newValue, suffix));

    if (onChange && value !== newValue) {
      onChange({ target: { name, value: newValue } });
    }
  };

  const getFilterOptions = (opts: string[]) => {
    return opts;
  };

  const getOptionsSelected = (option: string) => {
    if (inputValue && inputValue !== "") {
      return toNumber(option) === toNumber(inputValue);
    }
    return false;
  };

  const handleInputChange = (event: ChangeEvent<any>, newValue: string, reason: string) => {
    const regex = /^[0-9%\b]+$/;

    if (newValue === "" || regex.test(newValue)) {
      if (reason !== "input") {
        updateChange(newValue);
      } else {
        setInputValue(newValue);
      }
    }
  };

  const handleBlur = (event: FocusEvent) => {
    updateChange(inputValue);
  };

  return (
    <Autocomplete
      freeSolo
      inputValue={inputValue}
      options={options}
      renderInput={(params) => <TextField {...params} variant="outlined" onBlur={handleBlur} />}
      disableClearable={true}
      forcePopupIcon={true}
      popupIcon={DropdownImg}
      className={clsx("mui-autocomplete", className)}
      filterOptions={getFilterOptions}
      getOptionSelected={getOptionsSelected}
      onInputChange={handleInputChange}
    />
  );
}

export default BlmAutoComplete;
