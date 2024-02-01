import React, { ChangeEvent } from "react";
import { Select, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, Threshold } from "types";
import { findIndex } from "utils";
import { MarkerThreshold } from "./types";
import "./threshold.scss";

interface CompProps {
  data?: MarkerThreshold | Threshold;
  elements?: CourseElement[];
  onChange?: (data: MarkerThreshold | Threshold) => void;
}

function BlmThreshold(props: CompProps) {
  const { data, elements, onChange } = props;
  let { threshold = 100, feedback = "" } = data || {};
  const title = data && "start" in data ? data.start + " - " + data.end : threshold;
  const { t } = useTranslation();

  //We need unselect if previously selcted element is deleted
  if (!elements || findIndex(elements, feedback, "id") === -1) {
    feedback = "";
  }

  const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
    if (data) {
      const { value } = event.target;
      const newData = { ...data, feedback: value as string };

      if (onChange) {
        onChange(newData);
      }
    }
  };

  return (
    <div className="threshold-wrapper">
      <div className="threshold-lbl">{title}</div>
      <Select displayEmpty value={feedback} className="threshold-dropdown" onChange={handleChange}>
        <MenuItem key="default" value="">
          <em>{t("label.select_1")}</em>
        </MenuItem>
        {elements &&
          elements.map((element) => (
            <MenuItem key={element.id} value={element.id}>
              {element.name}
            </MenuItem>
          ))}
      </Select>
    </div>
  );
}

export default BlmThreshold;
