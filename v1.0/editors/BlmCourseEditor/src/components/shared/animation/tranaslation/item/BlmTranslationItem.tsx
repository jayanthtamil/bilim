import React, { ChangeEvent, useRef } from "react";

import { AnimationTranslation } from "types";
import BlmAutoTextArea from "shared/auto-textarea";
import "./styles.scss";

export interface CompProps {
  data: AnimationTranslation;
  onChange?: (data: AnimationTranslation) => void;
}

function BlmTranslationItem(props: CompProps) {
  const { data, onChange } = props;
  const { text } = data;
  const { current: label } = useRef(text);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      const newData = { ...data };
      newData.text = event.target.value;

      onChange(newData);
    }
  };

  return (
    <div className="translation-item-wrapper">
      <div className="translation-item-lbl">{label}</div>
      <BlmAutoTextArea value={text} className="translation-item-txt" onChange={handleChange} />
    </div>
  );
}

export default BlmTranslationItem;
