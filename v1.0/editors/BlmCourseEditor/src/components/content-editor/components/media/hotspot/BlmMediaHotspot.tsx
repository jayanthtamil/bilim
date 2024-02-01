import React, { Fragment, MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { MediaComponent } from "types";
import { MediaVariants } from "editor-constants";
import {
  getMediaHotspot,
  getMediaHotspot360,
  getMediaHotspotPlain,
  isMediaHotspot,
  isMediaHotspot360,
} from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import BlmMediaDashboard from "../dashboard";
import BlmHotspotClassic from "./classic";
import BlmHotspot360 from "./360";
import "./styles.scss";

export interface CompProps {
  label: string;
  data: MediaComponent;
}

function BlmMediaHotspot(props: CompProps) {
  const { data } = props;
  const state = getMediaHotspotPlain(data);
  const { dispatch } = useContentEditorCtx();
  const { t } = useTranslation("content-editor");
  const { variant } = state;
  const [openModal, setOpenModal] = useState(false);

  const updateChange = (newData: MediaComponent) => {
    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const handleOptionClick = (event: MouseEvent<HTMLDivElement>) => {
    // const { currentTarget, ctrlKey, altKey, shiftKey } = event;
    const { currentTarget } = event;
    const value = currentTarget.getAttribute("data-value");

    if (value === MediaVariants.Hotspot) {
      updateChange(getMediaHotspot(state));
      // } else if (value === MediaVariants.Hotspot360 && ctrlKey && altKey && shiftKey) {
    } else if (value === MediaVariants.Hotspot360) {
      updateChange(getMediaHotspot360(state));
    }
  };

  const handleOpenModalClick = (event: MouseEvent<HTMLDivElement>) => {
    setOpenModal((prev) => !prev);
  };

  const handleOnModalClose = () => {
    setOpenModal((prev) => !prev);
  };

  return (
    <Fragment>
      <BlmMediaDashboard data={state}>
        <div className="content-media-hotspot-wrapper">
          {variant === MediaVariants.Hotspot360 && (
            <div className="hotspot-edit-btn" onClick={handleOpenModalClick} />
          )}
          <div className="hotspot-params-title">{t("title.parameters")}</div>
          {variant === MediaVariants.HotspotPlain && (
            <div className="hotspot-selection-wrapper">
              <div
                className="hotspot-option classic"
                data-value={MediaVariants.Hotspot}
                onClick={handleOptionClick}
              >
                <div className="hotspot-option-title">Classic</div>
                <div className="hotspot-option-description">Add hotspots on picture</div>
                <div className="hotspot-option-icon" />
              </div>
              <div
                className="hotspot-option h360"
                data-value={MediaVariants.Hotspot360}
                onClick={handleOptionClick}
              >
                <div className="hotspot-option-title">360</div>
                <div className="hotspot-option-description">Add hotspots on 360 photo</div>
                <div className="hotspot-option-icon" />
              </div>
            </div>
          )}
          {isMediaHotspot(state) && <BlmHotspotClassic data={state} />}
          {isMediaHotspot360(state) && (
            <BlmHotspot360
              data={state}
              openModal={openModal}
              onClose={handleOnModalClose}
              onSave={handleOnModalClose}
            />
          )}
        </div>
      </BlmMediaDashboard>
    </Fragment>
  );
}

export default BlmMediaHotspot;
