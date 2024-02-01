import React from "react";
import { useTranslation } from "react-i18next";

import { MediaComponent, MediaCustom } from "types";
import { getMediaCustom } from "utils";
import { BlmAnimation, MediaPickerChangeEvent } from "components/shared";
import { updateMediaComponent } from "components/content-editor/reducers";
import { useContentEditorCtx } from "components/content-editor/core";
import BlmMediaDashboard from "../dashboard";
import "./styles.scss";

export interface CompProps {
  label: string;
  data: MediaComponent;
}

function BlmMediaCustom(props: CompProps) {
  const { data } = props;
  const state = getMediaCustom(data);
  const custom = state.value;
  const { element, dispatch } = useContentEditorCtx();
  const { media } = custom;
  const { t } = useTranslation("content-editor");

  const updateChange = (newCustom: MediaCustom) => {
    const newData = {
      ...state,
      value: newCustom,
    };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const handleChange = (event: MediaPickerChangeEvent) => {
    const { name, value } = event.target;
    const newCustom = { ...custom };

    if (name === "media") {
      newCustom.media = value;
    }

    updateChange(newCustom);
  };

  return (
    <BlmMediaDashboard data={state}>
      <div className="content-media-custom-wrapper">
        <div className="custom-params-title">{t("title.parameters")}</div>
        <BlmAnimation elementId={element!.id} data={media} onChange={handleChange} />
      </div>
    </BlmMediaDashboard>
  );
}

export default BlmMediaCustom;
