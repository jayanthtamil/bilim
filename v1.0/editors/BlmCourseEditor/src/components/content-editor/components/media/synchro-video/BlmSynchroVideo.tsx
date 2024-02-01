import React, { Fragment, useState } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MediaComponent, MediaFile, MediaTrackCue, SynchroVideo } from "types";
import { AcceptedFileTypes, MediaTypes } from "editor-constants";
import { getMediaSynchroVideo, isJSON } from "utils";
import { BlmToggleButton } from "shared";
import { BlmBaseMediaEditor, BlmMediaPicker } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import BlmMediaDashboard from "../dashboard";
import "./styles.scss";

export interface CompProps {
  label: string;
  data: MediaComponent;
}

type SynchroMediaTypes = Exclude<MediaTypes, MediaTypes.Image>;

function BlmSynchroVideo(props: CompProps) {
  const { data } = props;
  const state = getMediaSynchroVideo(data);
  const [type, setType] = useState<SynchroMediaTypes>(MediaTypes.Main);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { element, dispatch } = useContentEditorCtx();
  const { value: synchro } = state;
  const { main, webm, labels, contents, [type]: media } = synchro;
  const hasMain = Boolean(main);
  const hasLottie = main ? isJSON(main.type) : false;
  const hasVideoSelected = main ? true : false;
  const { t } = useTranslation("content-editor");

  const updateChange = (newSynchro: SynchroVideo) => {
    const newData = { ...state, value: newSynchro };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const handleTypeChange = (event: CustomChangeEvent<boolean>) => {
    const target = event.target;
    const { name } = target;

    setType(name as SynchroMediaTypes);
  };

  const handleChange = (event: CustomChangeEvent<MediaFile | undefined>) => {
    const { name, value } = event.target;
    const newSynchro = { ...synchro };

    if (name === "main" || name === "webm") {
      newSynchro[name] = value;
    }

    updateChange(newSynchro);
  };

  const handleEditClick = () => {
    setIsEditorOpen(true);
  };

  const handleEditorSave = (newLabels?: MediaTrackCue[], newContents?: MediaTrackCue[]) => {
    if (newLabels && newContents) {
      const newSynchro = { ...synchro, labels: newLabels, contents: newContents };

      updateChange(newSynchro);
    }

    setIsEditorOpen(false);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
  };

  const getAcceptedTypes = () => {
    if (type === MediaTypes.Webm) {
      return [AcceptedFileTypes.Webm];
    } else {
      return [AcceptedFileTypes.Video, AcceptedFileTypes.JSON];
    }
  };

  return (
    <BlmMediaDashboard data={state}>
      <div className="content-synchro-video-wrapper">
        <div className="synchro-video-params-title">{t("title.parameters")}</div>
        <div className="synchro-video-main-wrapper">
          <BlmMediaPicker
            name={type}
            elementId={element!.id}
            acceptedFiles={getAcceptedTypes()}
            data={media}
            previewZone={hasLottie ? "none" : "display"}
            showEdit={false}
            className="media-picker-3"
            onChange={handleChange}
          />
          {!hasLottie && hasVideoSelected && (
            <Fragment>
              <BlmToggleButton
                name={MediaTypes.Main}
                selected={type === MediaTypes.Main}
                className={clsx("mp4-toggle-btn", { media: hasMain })}
                onChange={handleTypeChange}
              >
                Mp4
              </BlmToggleButton>
              <BlmToggleButton
                name={MediaTypes.Webm}
                disabled={!hasMain}
                selected={type === MediaTypes.Webm}
                className={clsx("webm-toggle-btn", { media: Boolean(webm) })}
                onChange={handleTypeChange}
              >
                Webm
              </BlmToggleButton>
            </Fragment>
          )}
        </div>
        <div className="synchro-video-markers-title">{t("synchro.synchro")}</div>
        <div
          className={clsx("synchro-video-edit-btn", { disabled: !hasMain })}
          onClick={handleEditClick}
        >
          {t("button.edit")}
        </div>
        {isEditorOpen && main && (
          <BlmBaseMediaEditor
            open={isEditorOpen}
            type="synchro-video"
            elementId={element!.id}
            data={main}
            peaks={[]}
            cues1={labels}
            cues2={contents}
            onSave={handleEditorSave}
            onClose={handleEditorClose}
          />
        )}
      </div>
    </BlmMediaDashboard>
  );
}

export default BlmSynchroVideo;
