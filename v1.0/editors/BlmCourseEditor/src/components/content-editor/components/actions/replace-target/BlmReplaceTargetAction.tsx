import React, { ChangeEvent, Fragment, useMemo } from "react";
import { Select, MenuItem, ListItemIcon, Checkbox } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { ComponentStyle, MediaFile, CustomChangeEvent, ReplaceTargetAction } from "types";
import { ElementType } from "editor-constants";
import { getMediaTargets } from "utils";
import BlmStructureSelect from "components/structures/select";
import { useContentEditorCtx } from "components/content-editor/core";
import "./styles.scss";

export interface CompProps {
  data?: ReplaceTargetAction;
  onChange?: (event: CustomChangeEvent<ReplaceTargetAction>) => void;
  name: String;
}

function BlmReplaceTargetAction(props: CompProps) {
  const { data, onChange, name } = props;
  const { element, template } = useContentEditorCtx();
  const targets = useMemo(() => getMediaTargets(template!), [template]);
  const defaultTarget = targets.length === 1 ? targets[0].id : undefined;
  const { replaceTargetId = defaultTarget, replaceId, restore } = data || {};
  const { t } = useTranslation("content-editor");

  const updateChange = (newData: ReplaceTargetAction) => {
    if (onChange) {
      onChange({ target: { name: "target", value: newData } });
    }
  };

  const handleChange = (
    event: ChangeEvent<any> | CustomChangeEvent<MediaFile | string | ComponentStyle | undefined>
  ) => {
    const { name, value, checked } = event.target;
    const newData = { replaceTargetId, replaceId, restore };

    if (name === "target") {
      newData.replaceTargetId = value;
    } else if (name === "simpleContent") {
      newData.replaceId = value;
    } else if (name === "restoreOnMouseOut" && props.name === "overAction") {
      newData.restore = checked;
    }
    updateChange(newData);
  };

  return (
    <div className="replace-target-action-wrapper">
      <Select
        value={replaceTargetId || "none"}
        MenuProps={{ className: "replace-target-dropdown-popover" }}
        className="replace-target-dropdown"
      >
        {targets.length !== 1 && (
          <MenuItem value="none">
            {targets.length ? (
              <Fragment>
                <ListItemIcon />
                {t("target_option.select_target")}
              </Fragment>
            ) : (
              `${t("target_option.no_target")}`
            )}
          </MenuItem>
        )}
        {targets.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            <ListItemIcon />
            {item.value.name}
          </MenuItem>
        ))}
      </Select>
      {targets.length === 0 && (
        <div className="replace-target-warning-lbl">
          <span>{t("target_option.no_target")}.</span>
          <span>{t("target_option.transform_media")}</span>
        </div>
      )}
      {replaceTargetId && (
        <BlmStructureSelect
          name="simpleContent"
          element={element}
          structures={{ show: false }}
          annexes={{ show: true }}
          value={replaceId}
          placeholder={t("target_option.select_simple_content")}
          selectables={[
            ElementType.SimplePage,
            ElementType.SimpleContent,
            ElementType.Page,
            ElementType.Screen,
          ]}
          className="structure-select-with-icons"
          onChange={handleChange}
        />
      )}
      {name === "overAction" && (restore === false || restore === true) && (
        <div className="restore-box">
          <Checkbox checked={restore} name="restoreOnMouseOut" onChange={handleChange} />
          <strong className="restore-check-box-label">{t("label.restoreMouseOut")}</strong>
        </div>
      )}
    </div>
  );
}

export default BlmReplaceTargetAction;
