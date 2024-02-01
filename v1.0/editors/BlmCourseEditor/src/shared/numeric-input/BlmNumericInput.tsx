import React, {
  useState,
  useEffect,
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  ForwardRefRenderFunction,
  forwardRef,
} from "react";
import clamp from "lodash/clamp";

import { CustomChangeEvent } from "types";
import { toNumber } from "utils";

export type NumericInputChangeEvent = CustomChangeEvent<number>;

interface CompProps {
  name: string;
  value?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  onChange?: (event: NumericInputChangeEvent) => void;
}

const TYPYPING_INTERVAL = 3000;

const BlmNumericInput: ForwardRefRenderFunction<HTMLInputElement, CompProps> = (props, ref) => {
  const { name, value, min, max, disabled, className, onChange } = props;
  const [text, setText] = useState("");
  const [validate, setValidate] = useState(false);

  useEffect(() => {
    const str = typeof value === "string" ? toNumber(value).toString() : value?.toString() ?? "";

    setText(str);
  }, [value]);

  useEffect(() => {
    if (validate) {
      const timerId = setTimeout(validateValue, TYPYPING_INTERVAL);

      return () => {
        clearTimeout(timerId);
      };
    }
  });

  const validateValue = () => {
    if (!validate) {
      return;
    }

    let newValue: number | undefined = clamp(toNumber(text), min ?? -Infinity, max ?? Infinity);

    if (isNaN(newValue)) {
      if (min !== undefined) {
        newValue = min;
      } else if (max !== undefined) {
        newValue = max;
      } else {
        newValue = value;
      }
    }

    setText((newValue ?? "").toString());

    if (onChange && newValue !== undefined) {
      onChange({
        target: {
          name,
          value: newValue,
        },
      });
    }

    setValidate(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const regex = /^$|^[0-9\b]+$/;
    const str = event.target.value;

    if (regex.test(str)) {
      setText(str);
      setValidate(true);
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
    <input
      ref={ref}
      value={text}
      min={min}
      max={max}
      disabled={disabled}
      className={className}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
};

export default forwardRef(BlmNumericInput);
