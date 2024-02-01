import React from "react";

import { CustomChangeEvent, ReplaceBackgroundAction } from "types";
import { AcceptedFileTypes } from "editor-constants";
import { BlmMediaPicker, MediaPickerChangeEvent } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import "./styles.scss";
import { Checkbox } from "@material-ui/core";
import { useTranslation } from "react-i18next";

export interface CompProps {
  data?: ReplaceBackgroundAction;
  onChange?: (event: CustomChangeEvent<ReplaceBackgroundAction>) => void;
  name: String;
}

function BlmReplaceBackgroundAction(props: CompProps) {
  const { data, onChange, name } = props;
  const { element } = useContentEditorCtx();
  const { background, restore } = data || {};
  const { t } = useTranslation("shared");

  const updateChange = (newData: ReplaceBackgroundAction) => {
    if (onChange) {
      onChange({ target: { name: "replaceBackground", value: newData } });
    }
  };

  const handleChange = (event: MediaPickerChangeEvent | any) => {
    const { value, name, checked } = event.target;
    let newData: ReplaceBackgroundAction = { background: value };

    if (name === "restoreOnMouseOut" && props.name === "overAction") {
      newData = { background: data?.background, restore: checked };
    } else if (name === "media" && props.name === "overAction") {
      newData = { background: value, restore: data?.restore };
    }
    updateChange(newData);
  };

 

  return (
    <div className="replace-background-action-wrapper">
      <BlmMediaPicker
        name="media"
        elementId={element!.id}
        acceptedFiles={[AcceptedFileTypes.Image, AcceptedFileTypes.Video]}
        data={background}
        placeholder="Select media"
        className="replace-background-picker"
        onChange={handleChange}
      />
      {name === "overAction" && (restore === false || restore === true) && (
        <div className="restore-box">
          <Checkbox name="restoreOnMouseOut" checked={restore} onChange={handleChange} />
          <strong className="restore-check-box-label">{t("roll_over.restoreMouseOut")}</strong>
        </div>
      )}
    </div>
  );
}
export default BlmReplaceBackgroundAction;
