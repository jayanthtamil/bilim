import React from "react";

import { CustomChangeEvent } from "types";
import { BlmAutoComplete } from "shared/material-ui";
import "./styles.scss";

export interface CompProps {
  name?: string;
  alpha?: number;
  onChange?: (event: AlphaPickerChangeEvent) => void;
}

export type AlphaPickerChangeEvent = CustomChangeEvent<number | undefined>;

const alphas = ["0%", "25%", "50%", "75%", "100%"];

function BlmAlphaPicker(props: CompProps) {
  const { name = "alpha", alpha, onChange } = props;

  return (
    <div className="alpha-picker-wrapper">
      <BlmAutoComplete
        name={name}
        value={alpha}
        suffix="%"
        min={0}
        max={100}
        options={alphas}
        onChange={onChange}
      />
    </div>
  );
}

export default BlmAlphaPicker;
