import React, { ChangeEvent, KeyboardEvent, ReactNode, useState } from "react";
import clsx from "clsx";
import { TextField } from "@material-ui/core";

import { CustomChangeEvent } from "types";
import { DropdownImg1 } from "assets/icons";
import { toNumber } from "utils";
import BlmAutoComplete from "./autocomplete";
import { useStyles } from "./styles";

export type NumericSelectChangeEvent = CustomChangeEvent<number | undefined>;
export type NumericSelectOption = { label: string; value: number };

export interface CompProps {
  name?: string;
  min?: number;
  max?: number;
  value?: number;
  label?: string;
  options?: NumericSelectOption[];
  popupIcon?: ReactNode;
  className?: string;
  popupClassName?: string;
  onChange?: (event: NumericSelectChangeEvent) => void;
}

function BlmNumericSelect(props: CompProps) {
  const {
    name = "select",
    min,
    max,
    value,
    label,
    options,
    popupIcon = <DropdownImg1 />,
    className,
    popupClassName,
    onChange,
  } = props;
  const [inputValue, setInputValue] = useState<string>();
  const classes = useStyles();
  const currentValue = inputValue ?? value?.toString() ?? "";

  const updateChange = (str: string) => {
    let newValue: number | undefined = toNumber(str);

    if (!isNaN(newValue)) {
      newValue = Math.min(Math.max(newValue, min || -Infinity), max || Infinity);
    } else {
      newValue = min;
    }

    setInputValue(undefined);

    if (onChange && value !== newValue) {
      onChange({ target: { name, value: newValue } });
    }
  };

  const getOptionLabel = (option: NumericSelectOption) => {
    if (typeof option === "string") {
      return option;
    }
    return option.value.toString();
  };

  const getOptionSelected = (option: NumericSelectOption) => {
    return currentValue !== "" && option.value === toNumber(currentValue);
  };

  const filterOptions = (opts: NumericSelectOption[]) => {
    return opts;
  };

  const handleInputChange = (event: ChangeEvent<any>, newValue: string, reason: string) => {
    const regex = /^[0-9%\b]+$/;

    if (newValue === "" || regex.test(newValue)) {
      if (reason === "input") {
        setInputValue(newValue);
      } else {
        updateChange(newValue);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      handleBlur();
    }
  };

  const handleBlur = () => {
    updateChange(currentValue);
  };

  return (
    <BlmAutoComplete
      freeSolo
      disableClearable
      suffix={label}
      value={currentValue}
      inputValue={currentValue}
      options={options || []}
      forcePopupIcon={options && options.length > 0}
      renderInput={(params) => (
        <TextField {...params} variant="outlined" onBlur={handleBlur} onKeyDown={handleKeyDown} />
      )}
      renderOption={(opt) => opt.label}
      popupIcon={popupIcon}
      className={clsx(classes.root, className)}
      popupClassName={popupClassName}
      getOptionLabel={getOptionLabel}
      getOptionSelected={getOptionSelected}
      filterOptions={filterOptions}
      onInputChange={handleInputChange}
    />
  );
}

export default BlmNumericSelect;
