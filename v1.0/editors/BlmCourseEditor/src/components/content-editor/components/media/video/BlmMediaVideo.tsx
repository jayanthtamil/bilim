import React, { ChangeEvent } from "react";
import { Select, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { MediaComponent } from "types";
import { MediaVariants } from "editor-constants";
import {
  getMediaVideo,
  getMediaExternalVideo,
  getMediaStandardVideo,
  isMediaExternalVideo,
  isMediaStandardVideo,
} from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import BlmMediaDashboard from "../dashboard";
import BlmExternalVideo from "./external";
import BlmStandardVideo from "./standard";
import "./styles.scss";

export interface CompProps {
  label: string;
  data: MediaComponent;
}

function BlmMediaVideo(props: CompProps) {
  const { data } = props;
  const state = getMediaVideo(data);
  const { variant } = state;
  const { dispatch } = useContentEditorCtx();
  const { t } = useTranslation("content-editor");

  const updateChange = (newData: MediaComponent) => {
    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const handleChange = (event: ChangeEvent<any>) => {
    const { value } = event.target;

    if (value === MediaVariants.VideoExternal) {
      updateChange(getMediaExternalVideo(state));
    } else if (value === MediaVariants.VideoStandard) {
      updateChange(getMediaStandardVideo(state));
    }
  };

  return (
    <BlmMediaDashboard data={state}>
      <div className="content-media-video-wrapper">
        <div className="video-params-wrapper">
          <div className="video-params-title">{t("title.parameters")}</div>
          <Select
            name="videoType"
            value={variant}
            MenuProps={{
              className: "video-types-dropdown-menus",
            }}
            className="video-types-dropdown"
            onChange={handleChange}
          >
            <MenuItem value={MediaVariants.Video} className="none">
              {t("label.select")}
            </MenuItem>
            <MenuItem value={MediaVariants.VideoExternal}>
              <div className="video-types-dropdown-item external">
                <span className="video-item-title">
                  {t("video.external")} <span className="video-item-title-icon">€</span>
                </span>
                <span className="video-item-sub-title">{t("video.no_subtitles")}</span>
                <span className="video-item-info">
                  {t("video.load_external")}
                  <br /> {t("video.platforms")}
                </span>
                <span className="video-item-icon" />
              </div>
            </MenuItem>
            <MenuItem value={MediaVariants.VideoStandard}>
              <div className="video-types-dropdown-item standard">
                <span className="video-item-title">
                  {t("video.video_standard")} <span className="video-item-title-icon">€€€</span>
                </span>
                <span className="video-item-sub-title">{t("video.with_subtitles")}</span>
                <span className="video-item-info">
                  {t("video.importer_video_with")} <br />
                  {t("video.subtitles")}
                </span>
                <span className="video-item-icon" />
              </div>
            </MenuItem>
          </Select>
        </div>
        {isMediaExternalVideo(state) && <BlmExternalVideo data={state} />}
        {isMediaStandardVideo(state) && <BlmStandardVideo data={state} />}
      </div>
    </BlmMediaDashboard>
  );
}
export default BlmMediaVideo;
