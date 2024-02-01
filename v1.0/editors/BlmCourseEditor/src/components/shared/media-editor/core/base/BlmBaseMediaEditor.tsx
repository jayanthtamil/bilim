import React, { Fragment, useRef, useState, useEffect, useMemo, MouseEvent } from "react";
import clsx from "clsx";
import { Drawer } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { MediaFile, MediaTrackCue } from "types";
import { addObject, isAudio, isVideo } from "utils";
import {
  MediaCueActions,
  MediaCuePositions,
  MediaPlayerTypes,
  MediaTrackTypes,
} from "editor-constants";
import {
  BlmMediaDashboard,
  BlmMediaPlayer,
  BlmCueList,
  BlmSeekBar,
  BlmMediaWave,
  BlmRuler,
  BlmMainTimeline,
  BlmTopTimeline,
  BlmWaveScroller,
  MediaPlayerRef,
  BlmMediaEditorProvider,
} from "../../components";
import { findCueIndex, getCurrentCue, getCurrentVideoCues, validateCues } from "../../utils";
import { ContainerProps } from "./container";
import { DOMAIN } from "config";
import "./styles.scss";

export interface BaseMediaEditorProps extends ContainerProps {
  open?: boolean;
  type?: "standard" | "synchro-video";
  elementId: string;
  data: MediaFile;
  peaks?: number[];
  cues1?: MediaTrackCue[];
  cues2?: MediaTrackCue[];
  onSave?: (cues1?: MediaTrackCue[], cues2?: MediaTrackCue[], duration?: number) => void;
  onClose?: (event: MouseEvent) => void;
}

interface EditorState {
  subtitles: MediaTrackCue[];
  markers: MediaTrackCue[];
  isEdited: boolean;
}

const initEditor: EditorState = {
  subtitles: [],
  markers: [],
  isEdited: false,
};

function BlmBaseMediaEditor(props: BaseMediaEditorProps) {
  const {
    open,
    type = "standard",
    elementId,
    data,
    peaks,
    cues1,
    cues2,
    onSave,
    onClose,
    openDialog,
    openConfirmDialog,
  } = props;
  const playerRef = useRef<MediaPlayerRef>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [editor, setEditor] = useState<EditorState>(initEditor);
  const [subtitle, setSubtitle] = useState<MediaTrackCue>();
  const [marker, setMarker] = useState<MediaTrackCue>();
  const isPlaying = playerRef.current?.isPlaying() ?? false;
  const { subtitles, markers, isEdited } = editor;
  const { url } = data;
  const isStandard = type === "standard";
  const trackType1 = isStandard ? MediaTrackTypes.Subtitles : MediaTrackTypes.Labels;
  const trackType2 = isStandard ? MediaTrackTypes.Markers : MediaTrackTypes.Contents;
  const { t } = useTranslation("shared");

  const playerType = useMemo(() => {
    if (isAudio(data.type)) {
      return MediaPlayerTypes.Audio;
    } else if (isVideo(data.type)) {
      return MediaPlayerTypes.Video;
    } else {
      return MediaPlayerTypes.Lottie;
    }
  }, [data]);

  useEffect(() => {
    if (cues1 && cues2 && duration) {
      setEditor({
        subtitles: getCurrentVideoCues(cues1, duration),
        markers: getCurrentVideoCues(cues2, duration),
        isEdited: false,
      });
    }
  }, [cues1, cues2, duration]);

  useEffect(() => {
    const cue = getCurrentCue(subtitles, currentTime);

    setSubtitle(cue);
  }, [currentTime, subtitles]);

  useEffect(() => {
    const cue = getCurrentCue(markers, currentTime);

    setMarker(cue);
  }, [currentTime, markers]);

  const pause = () => {
    playerRef.current?.pause();
  };

  const seek = (time: number) => {
    playerRef.current?.seek(time);
  };

  const validateChanges = (callback: Function) => {
    if (isEdited) {
      try {
        validateCues(trackType2, markers);
        callback();
      } catch (error) {
        openDialog(`${t("alert.warning")}`, (error as Error).message);
      }
    }
  };

  const saveChanges = () => {
    const [newCues1, newCues2] = isEdited ? [subtitles, markers] : [];

    if (onSave) {
      onSave(newCues1, newCues2, duration);
    }
  };

  const handleCurrentTimeChange = (time: number) => {
    setCurrentTime(time);
  };

  const handleDurationTimeChange = (time: number) => {
    setDuration(time);
  };

  const handleTimeChange = (time: number) => {
    seek(time);
  };

  const handleDashboardClick = () => {
    pause();
  };

  const handleTrackClick = (track: MediaTrackCue) => {
    pause();

    if (track.startTime <= duration) {
      seek(track.startTime + 0.001);
    }
  };

  const handleAdd = (trackType: MediaTrackTypes, startTime: number, endTime: number) => {
    const cue = new MediaTrackCue(startTime, endTime);

    if (trackType === MediaTrackTypes.Subtitles || trackType === MediaTrackTypes.Labels) {
      const ind = findCueIndex(trackType, subtitles, startTime) + 1;

      if (trackType === MediaTrackTypes.Subtitles) {
        cue.text = "Subtitle Text";
      } else {
        cue.text = "Label Text";
        cue.position = MediaCuePositions.BottomLeft;
      }

      handleChange(trackType, addObject(subtitles, cue, ind));
    } else {
      const ind = findCueIndex(trackType, markers, startTime) + 1;

      if (trackType === MediaTrackTypes.Markers) {
        cue.text = "Marker Text";
      } else {
        cue.action = MediaCueActions.ScrollVScrollC;
      }

      handleChange(trackType, addObject(markers, cue, ind));
    }
  };

  const handleChange = (type: MediaTrackTypes, cues: MediaTrackCue[]) => {
    if (type === MediaTrackTypes.Subtitles || type === MediaTrackTypes.Labels) {
      pause();
      setEditor({ ...editor, subtitles: cues, isEdited: true });
    } else {
      setEditor({ ...editor, markers: cues, isEdited: true });
    }
  };

  const handleSave = (event: MouseEvent) => {
    validateChanges(() => {
      saveChanges();
    });
  };

  const handleClose = (event: MouseEvent) => {
    if (onClose) {
      onClose(event);
    }
  };

  const openSaveConfirmDialog = () => {
    const options = {
      className: "template-editor-warning-dialog",
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    openConfirmDialog(
      `${t("alert.cancel_confirm")}`,
      `${t("alert.save_all_changes")}`,
      handleSave,
      handleClose,
      options
    );
  };

  const handleDrawerClose = (event: any) => {
    if (isEdited) {
      openSaveConfirmDialog();
    } else {
      handleClose(event);
    }
  };

  const handleCloseClick = (event: MouseEvent) => {
    if (isEdited) {
      handleSave(event);
    } else {
      handleClose(event);
    }
  };

  const handleDownoadUrl = (type: MediaTrackTypes, url: string) => {
    var downloadLink = document.createElement("a");
    downloadLink.href = DOMAIN + url;
    downloadLink.download = type + ".vtt";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleImportandExport = (type: MediaTrackTypes) => {
    if (type === MediaTrackTypes.Subtitles && data.subtitle) {
      handleDownoadUrl(type, data.subtitle?.url);
    } else if (type === MediaTrackTypes.Markers && data.marker) {
      handleDownoadUrl(type, data.marker?.url);
    }
  };

  return (
    <Drawer className={clsx("media-editor-drawer", type)} open={open} onClose={handleDrawerClose}>
      <BlmMediaEditorProvider playerType={playerType}>
        <div className={clsx("media-editor-wrapper", playerType)}>
          <BlmMediaDashboard
            title={
              isStandard
                ? `${t("base_media_editor.subtitle_marker")}`
                : `${t("base_media_editor.synchro_video")}`
            }
            type={trackType1}
            isPlaying={isPlaying}
            data={subtitles}
            currentCue={subtitle}
            onClick={handleDashboardClick}
            onChange={handleChange}
          >
            <BlmMediaPlayer
              ref={playerRef}
              src={url}
              onTimeChange={handleCurrentTimeChange}
              onDurationChange={handleDurationTimeChange}
            />
          </BlmMediaDashboard>
          <BlmCueList
            type={trackType1}
            data={subtitles}
            currentCue={subtitle}
            duration={duration}
            onChange={handleChange}
            onTrackClick={handleTrackClick}
            onClickExport={handleImportandExport}
          />
          <BlmCueList
            type={trackType2}
            data={markers}
            currentCue={marker}
            duration={duration}
            elementId={elementId}
            onChange={handleChange}
            onTrackClick={handleTrackClick}
            onClickExport={handleImportandExport}
          />
          <BlmSeekBar
            type={playerType}
            currentTime={currentTime}
            duration={duration}
            subtitles={subtitles}
            markers={markers}
            onChange={handleTimeChange}
          />
          <BlmMediaWave
            type={playerType}
            peaks={peaks}
            duration={duration}
            playerRef={playerRef}
            render={(wavesurfer) => (
              <Fragment>
                <BlmRuler
                  type={trackType1}
                  isPlaying={isPlaying}
                  wavesurfer={wavesurfer}
                  onAdd={handleAdd}
                />
                <BlmWaveScroller wavesurfer={wavesurfer} onChange={handleTimeChange} />
                <BlmMainTimeline
                  type={trackType1}
                  wavesurfer={wavesurfer}
                  data={subtitles}
                  onChange={handleChange}
                  onTimeChange={handleTimeChange}
                />
                <BlmTopTimeline
                  type={trackType2}
                  wavesurfer={wavesurfer}
                  data={markers}
                  currentCue={marker}
                  onAdd={handleAdd}
                  onChange={handleChange}
                  onTimeChange={handleTimeChange}
                />
              </Fragment>
            )}
          />
          <div className="media-editor-close-btn" onClick={handleCloseClick} />
        </div>
      </BlmMediaEditorProvider>
    </Drawer>
  );
}

export default BlmBaseMediaEditor;
