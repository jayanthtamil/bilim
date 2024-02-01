import React, {
  useState,
  useEffect,
  ChangeEvent,
  HTMLAttributes,
  FocusEvent,
  KeyboardEvent,
  ForwardRefRenderFunction,
  forwardRef,
} from "react";
import clsx from "clsx";

import { CustomChangeEvent } from "types";
import "./subscript-input.scss";

export type SubscriptInputChangeEvent = CustomChangeEvent<number>;

interface CompProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  name: string;
  label: string;
  value?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange?: (event: SubscriptInputChangeEvent) => void;
}

const TYPYPING_INTERVAL = 3000;

const BlmSubscriptInput: ForwardRefRenderFunction<HTMLInputElement, CompProps> = (props, ref) => {
  const { name, value, label, min, max, disabled, className, onChange, ...other } = props;
  const [currentValue, setCurrentValue] = useState("");
  const [shouldValidate, setShouldValidate] = useState(false);

  useEffect(() => {
    setCurrentValue(value !== undefined ? value.toString() : "");
  }, [value]);

  useEffect(() => {
    if (shouldValidate) {
      const timerId = setTimeout(validateValue, TYPYPING_INTERVAL);

      return () => {
        clearTimeout(timerId);
      };
    }
  });

  const validateValue = () => {
    if (!shouldValidate) {
      return;
    }

    let newValue = currentValue;

    if (newValue !== "") {
      if (min !== undefined) {
        newValue = Math.max(min, Number(newValue)).toString();
      }
      if (max !== undefined) {
        newValue = Math.min(max, Number(newValue)).toString();
      }

      if (newValue !== currentValue) {
        setCurrentValue(newValue);
      }

      if (onChange) {
        onChange({
          target: {
            name,
            value: Number(newValue),
          },
        });
      }
    }

    setShouldValidate(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const regex = /^$|^[0-9\b]+$/;
    let valueStr = event.target.value;

    if (regex.test(valueStr)) {
      setCurrentValue(valueStr);
      setShouldValidate(true);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.keyCode === 13) {
      validateValue();
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    validateValue();
  };

  return (
    <div className={clsx("subscript-input-container", className, { disabled })} {...other}>
      <input
        ref={ref}
        value={currentValue}
        min={min}
        max={max}
        disabled={disabled}
        className="subscript-input"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <span className="subscript-lbl">{label}</span>
    </div>
  );
};

export default forwardRef(BlmSubscriptInput);
