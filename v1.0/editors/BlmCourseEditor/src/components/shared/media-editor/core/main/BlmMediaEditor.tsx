import React, { useState, useEffect, MouseEvent, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { MediaFile, MediaTrackCue } from "types";
import { createMediaCues, createUUID, createVTTFile } from "utils";
import { normalizeMarkers } from "../../utils";
import BlmBaseMediaEditor from "../base";
import { ContainerProps } from "./container";

export interface MediaEditorProps {
  open?: boolean;
  elementId: string;
  data: MediaFile;
  onSave?: (data: MediaFile) => void;
  onClose?: (event: MouseEvent) => void;
}

function BlmMediaEditor(props: MediaEditorProps & ContainerProps) {
  const {
    open,
    elementId,
    data,
    files,
    waveformUrl,
    waveformFile,
    subtitleFile,
    markerFile,
    onSave,
    onClose,
    uploadFiles,
    clearFile,
    addFiles,
    getFile,
    getMediaProperties,
    openDialog,
  } = props;
  const [upload, setUpload] = useState<{ id: string; isNewFile: boolean }>();
  const [peaks, setPeaks] = useState<number[]>();
  const [subtitles, setSubtitles] = useState<MediaTrackCue[]>([]);
  const [markers, setMarkers] = useState<MediaTrackCue[]>([]);
  const { id, waveform = waveformUrl, subtitle, marker } = data;
  const { t } = useTranslation();

  const updateSave = useCallback(
    (newSubtitle?: MediaFile, newMarker?: MediaFile) => {
      if (onSave) {
        onSave({
          ...data,
          waveform,
          subtitle: newSubtitle || subtitle,
          marker: newMarker || marker,
        });
      }
    },
    [data, waveform, subtitle, marker, onSave]
  );

  useEffect(() => {
    if (!waveform) {
      getMediaProperties(id);
    }
  }, [id, waveform, getMediaProperties]);

  useEffect(() => {
    if (id && waveform && !waveformFile) {
      getFile(id, waveform);
    }
  }, [id, waveform, waveformFile, getFile]);

  useEffect(() => {
    if (subtitle && !subtitleFile) {
      getFile(subtitle.id, subtitle.url);
    }
  }, [subtitle, subtitleFile, getFile]);

  useEffect(() => {
    if (marker && !markerFile) {
      getFile(marker.id, marker.url);
    }
  }, [marker, markerFile, getFile]);

  useEffect(() => {
    if (typeof waveformFile === "object" && Array.isArray(waveformFile.data)) {
      setPeaks(waveformFile.data);
    }
  }, [waveformFile]);

  useEffect(() => {
    if (typeof subtitleFile === "string") {
      try {
        const subtitles = createMediaCues(subtitleFile);

        setSubtitles(subtitles);
      } catch (er) {
        openDialog(`${t("alert.error")}`, `${t("alert.invalid_subtitle")}`);
      }
    }
  }, [subtitleFile, openDialog, t]);

  useEffect(() => {
    if (typeof markerFile === "string") {
      try {
        const markers = createMediaCues(markerFile).map((cue) => ({
          ...cue,
          endTime: NaN,
        }));

        setMarkers(markers);
      } catch (er) {
        openDialog(`${t("alert.error")}`, `${t("alert.invalid_marker")}`);
      }
    }
  }, [markerFile, openDialog, t]);

  useEffect(() => {
    if (upload) {
      const medias = files[upload.id];

      if (medias) {
        const [subtitle, marker] = medias;

        if (subtitle && marker) {
          updateSave(subtitle, marker);
          clearFile(upload.id);
          setUpload(undefined);

          if (upload.isNewFile) {
            addFiles([subtitle, marker]);
          }
        }
      }
    }
  }, [upload, files, clearFile, addFiles, updateSave]);

  const handleSave = (
    newSubtitles?: MediaTrackCue[],
    newMarkers?: MediaTrackCue[],
    duration = 0
  ) => {
    if (newSubtitles && newMarkers) {
      const id = createUUID();
      const file1 = {
        id: subtitle?.id,
        name: subtitle?.name || `${elementId}-subtitle.vtt`,
        content: createVTTFile(newSubtitles),
      };
      const file2 = {
        id: marker?.id,
        name: marker?.name || `${elementId}-marker.vtt`,
        content: createVTTFile(normalizeMarkers(newMarkers, duration)),
      };

      setUpload({ id, isNewFile: !Boolean(subtitle?.id) });
      uploadFiles(id, elementId, [file1, file2]);
    } else {
      updateSave();
    }
  };

  const handleClose = (event: MouseEvent) => {
    if (onClose) {
      onClose(event);
    }
  };

  return (
    <BlmBaseMediaEditor
      open={open}
      type="standard"
      elementId={elementId}
      peaks={peaks}
      data={data}
      cues1={subtitles}
      cues2={markers}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
}

export default BlmMediaEditor;
