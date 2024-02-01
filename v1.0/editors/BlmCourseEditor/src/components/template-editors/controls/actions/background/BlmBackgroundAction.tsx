import React, { ChangeEvent } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { BackgroundMedia, CourseElement, CustomChangeEvent, TemplateBackgroundAction } from "types";
import { ElementType } from "editor-constants";
import { BlmBackgroundMedia, BackgroundMediaChangeEvent } from "components/shared";
import "./styles.scss";

export interface CompProps {
  name: string;
  element: CourseElement;
  data?: TemplateBackgroundAction;
  onChange?: (event: CustomChangeEvent<TemplateBackgroundAction>) => void;
}

function BlmReplaceBackgroundAction(props: CompProps) {
  const { name, element, data, onChange } = props;
  const { checked = false, background = new BackgroundMedia() } = data || {};
  const type =
    element.type === ElementType.PartPage || element.type === ElementType.SimplePartPage
      ? "page-action"
      : "screen";
  const { t } = useTranslation("template-editors");

  const updateChange = (newData: TemplateBackgroundAction) => {
    if (onChange) {
      onChange({ target: { name, value: newData } });
    }
  };

  const handleChange = (event: ChangeEvent<any> | BackgroundMediaChangeEvent) => {
    const target = event.target;
    const name: string = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData: TemplateBackgroundAction = { ...data, checked };

    if (name === "checked" || name === "background") {
      newData[name] = value!;
    }

    updateChange(newData);
  };

  return (
    <div className="template-background-action-wrapper">
      <FormControlLabel
        name="checked"
        label={t("background_action.replace")}
        control={<Checkbox />}
        checked={checked}
        className="template-background-frm-lbl"
        onChange={handleChange}
      />
      {checked && (
        <BlmBackgroundMedia
          name="background"
          elementId={element.id}
          type={type}
          data={background}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
export default BlmReplaceBackgroundAction;
