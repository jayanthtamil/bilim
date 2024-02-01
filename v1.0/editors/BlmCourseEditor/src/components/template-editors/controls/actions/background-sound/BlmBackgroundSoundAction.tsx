import { Checkbox, FormControlLabel } from "@material-ui/core";
import { BlmMediaPickerEditor, MediaPickerChangeEvent } from "components/shared";
import { AcceptedFileTypes } from "editor-constants";
import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  CourseElement,
  CustomChangeEvent,
  TemplateBackgroundSoundAction,
  TemplateSoundAction,
} from "types";

export interface CompProps {
  name: string;
  element: CourseElement;
  data?: TemplateBackgroundSoundAction;
  onChange?: (event: CustomChangeEvent<TemplateSoundAction>) => void;
}

function BlmBackgroundSoundAction(props: CompProps) {
  const { name, element, data, onChange } = props;
  const { checked = false, backgroundsounds, unChecked = false } = data || {};
  const { t } = useTranslation("template-editors");
  const updateChange = (newData: TemplateBackgroundSoundAction) => {
    if (onChange) {
      onChange({ target: { name, value: newData } });
    }
  };
  const handleChange = (event: ChangeEvent<any> | MediaPickerChangeEvent) => {
    const target = event.target;
    const name: string = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData: TemplateBackgroundSoundAction = { ...data, checked, unChecked };

    if (name === "backgroundsounds") {
      if (value && !value.subtitle) {
        value.subtitle = newData.backgroundsounds?.subtitle;
      }
      if (value && !value.marker) {
        value.marker = newData.backgroundsounds?.marker;
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
        label={t("sound_action.play")}
        control={<Checkbox />}
        checked={checked}
        className={unChecked === true ? "template-sound-frm-lbl-disable" : "template-sound-frm-lbl"}
        onChange={handleChange}
        disabled={unChecked === true ? true : false}
      />
      <FormControlLabel
        name="unChecked"
        label={t("sound_action.stop")}
        control={<Checkbox />}
        checked={unChecked}
        className={checked === true ? "template-sound-frm-lbls-disable" : "template-sound-frm-lbls"}
        onChange={handleChange}
        disabled={checked === true ? true : false}
      />
      {checked && (
        <BlmMediaPickerEditor
          name="backgroundsounds"
          elementId={element.id}
          acceptedFiles={[AcceptedFileTypes.Audio]}
          data={backgroundsounds}
          placeholder={t("sound_action.select_media")}
          className="template-sound-picker"
          onChange={handleChange}
          showDesign="showDesign"
        />
      )}
    </div>
  );
}

export default BlmBackgroundSoundAction;
