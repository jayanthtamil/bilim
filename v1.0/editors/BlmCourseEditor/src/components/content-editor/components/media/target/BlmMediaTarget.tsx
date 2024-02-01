import React, { ChangeEvent } from "react";
import { MenuItem, Select } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { MediaComponent, MediaTarget } from "types";
import { ElementType, MediaTrasitions, TargetBackgroundDisplay } from "editor-constants";
import { getMediaTarget } from "utils";
import BlmStructureSelect, { StructureSelectChangeEvent } from "components/structures/select";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import BlmMediaDashboard from "../dashboard";
import clsx from "clsx";
import "./styles.scss";

export interface CompProps {
  label: string;
  data: MediaComponent;
}

function BlmMediaImage(props: CompProps) {
  const { data } = props;
  const { element, template: content, dispatch } = useContentEditorCtx();
  const state = getMediaTarget(data, content);
  const target = state.value;
  const { name, template, transition, background } = target;
  const { t } = useTranslation("content-editor");

  const updateChange = (newTarget: MediaTarget) => {
    const newData = {
      ...state,
      value: newTarget,
    };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const updateBackgroundChange = (background: TargetBackgroundDisplay) => {
    const newTarget = { ...target, background };

    updateChange(newTarget);
  };

  const handleChange = (event: ChangeEvent<any> | StructureSelectChangeEvent) => {
    const {
      name,
      value,
    }: {
      name: string;
      value: any;
    } = event.target;
    const newTarget = { ...target };

    if (name === "name") {
      newTarget.name = value.replace(/\s/g, "");
    } else if (name === "template") {
      newTarget.template = value;
    } else if (name === "transition") {
      newTarget.transition = value;
    }

    updateChange(newTarget);
  };

  const handleTemplateClick = () => {
    updateBackgroundChange(TargetBackgroundDisplay.Template);
  };

  const handleTargetClick = () => {
    updateBackgroundChange(TargetBackgroundDisplay.Target);
  };

  return (
    <BlmMediaDashboard data={state}>
      <div className="content-media-target-wrapper">
        <div className="target-params-wrapper">
          <div className="target-params-title">{t("title.parameters")}</div>
          <div className="target-name-lbl">{t("target.target_name")}</div>
          <input
            type="text"
            name="name"
            value={name}
            maxLength={15}
            className="target-name-txt"
            onChange={handleChange}
          />
        </div>
        <div className="target-other-params-wrapper">
          <div className="target-template-lbl">{t("target.default_temp")}</div>
          <div className="target-transition-lbl">{t("target.transition")}</div>
          <BlmStructureSelect
            name="template"
            className="target-template-dropdown"
            value={template}
            element={element!}
            structures={{ show: false }}
            annexes={{ show: true }}
            selectables={[
              ElementType.SimplePage,
              ElementType.SimpleContent,
              ElementType.Page,
              ElementType.Screen,
            ]}
            onChange={handleChange}
          />
          <Select
            name="transition"
            value={transition}
            className="target-transition-dropdown"
            onChange={handleChange}
          >
            <MenuItem value={MediaTrasitions.Fade}>{t("target.fade")}</MenuItem>
            <MenuItem value={MediaTrasitions.WipeLeft}>{t("target.wipe_left")}</MenuItem>
            <MenuItem value={MediaTrasitions.WipeDown}>{t("target.wipe_down")}</MenuItem>
            <MenuItem value={MediaTrasitions.None}>{t("target.none")}</MenuItem>
          </Select>
          <div className="target-background-wrapper">
            <span className="target-background-lbl">{t("target.target_background")}</span>
            <span className="target-bg-template-lbl">{t("target.full_template")}</span>
            <span className="target-bg-target-lbl">{t("target.only_target")}</span>
            <div
              className={clsx("target-bg-template", {
                selected: background === TargetBackgroundDisplay.Template,
              })}
              onClick={handleTemplateClick}
            />
            <div
              className={clsx("target-bg-target", {
                selected: background === TargetBackgroundDisplay.Target,
              })}
              onClick={handleTargetClick}
            />
          </div>
        </div>
      </div>
    </BlmMediaDashboard>
  );
}

export default BlmMediaImage;
