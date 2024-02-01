import React, { ChangeEvent } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, CustomChangeEvent, TemplateSoundAction } from "types";
import { AcceptedFileTypes } from "editor-constants";
import { BlmMediaPickerEditor, MediaPickerChangeEvent } from "components/shared";
import "./styles.scss";

export interface CompProps {
  name: string;
  element: CourseElement;
  data?: TemplateSoundAction;
  onChange?: (event: CustomChangeEvent<TemplateSoundAction>) => void;
}

function BlmReplaceSoundAction(props: CompProps) {
  const { name, element, data, onChange } = props;
  const { checked = false, sound, unChecked = false } = data || {};
  const { t } = useTranslation("template-editors");

  const updateChange = (newData: TemplateSoundAction) => {
    if (onChange) {
      onChange({ target: { name, value: newData } });
    }
  };

  const handleChange = (event: ChangeEvent<any> | MediaPickerChangeEvent) => {
    const target = event.target;
    const name: string = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData: TemplateSoundAction = { ...data, checked, unChecked };

    if (name === "sound") {
      if (value && !value.subtitle) {
        value.subtitle = newData.sound?.subtitle;
      }
      if (value && !value.marker) {
        value.marker = newData.sound?.marker;
      }
      newData[name] = value;
    } else if (name === "checked") {
      newData[name] = value;
    } else if (name === "unChecked") {
      newData["unChecked"] = value;
    }

    updateChange(newData);
  };

  return (
    <div className="template-sound-action-wrapper">
      <FormControlLabel
        name="checked"
        label={
          (name === "loadSound" && element.root?.type === "structure") || name === "completeSound"
            ? t("sound_action.play")
            : t("sound_action.play_sound")
        }
        control={<Checkbox />}
        checked={checked}
        className={
          unChecked === true
            ? "template-sound-frm-lbl-disable"
            : "template-sound-frm-lbl"
        }
        onChange={handleChange}
        disabled={unChecked === true ? true : false}
      />
      {name === "loadSound" && element.root?.type === "structure" && (
        <FormControlLabel
          name="unChecked"
          label={t("sound_action.stop")}
          control={<Checkbox />}
          checked={unChecked}
          className={
            checked === true 
              ? "template-sound-frm-lbls-disable"
              : "template-sound-frm-lbls"
          }
          onChange={handleChange}
          disabled={checked === true ? true : false}
        />
      )}
      {checked && (
        <BlmMediaPickerEditor
          name="sound"
          elementId={element.id}
          acceptedFiles={[AcceptedFileTypes.Audio]}
          data={sound}
          placeholder={t("sound_action.select_media")}
          className="template-sound-picker"
          onChange={handleChange}
          showDesign="showDesign"
        />
      )}
    </div>
  );
}
export default BlmReplaceSoundAction;
