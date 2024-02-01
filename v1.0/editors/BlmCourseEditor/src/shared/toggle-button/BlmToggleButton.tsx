import React, { MouseEvent, PropsWithChildren } from "react";
import clsx from "clsx";

import { CustomChangeEvent } from "types";
import "./styles.scss";

export type ToggleButtonChangeEvent = CustomChangeEvent<boolean>;

export interface CompProps {
  name: string;
  selected?: boolean;
  className?: string;
  disabled?: boolean;
  onChange?: (event: ToggleButtonChangeEvent) => void;
}

export function BlmToggleButton(props: PropsWithChildren<CompProps>) {
  const { name, selected = false, disabled = false, className, children, onChange } = props;

  const handleChange = (event: MouseEvent) => {
    if (disabled) {
      return;
    }

    if (onChange) {
      onChange({
        target: {
          name,
          value: !selected,
        },
      });
    }
  };

  return (
    <div
      className={clsx("toggle-button-wrapper", className, {
        selected: selected,
        disabled: disabled,
      })}
      onClick={handleChange}
    >
      {children}
    </div>
  );
}

export default BlmToggleButton;
