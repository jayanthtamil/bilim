import React, { ChangeEvent, useMemo, useRef } from "react";
import clsx from "clsx";
import { AutoSizer, CellMeasurerCache, List, ListRowProps, CellMeasurer } from "react-virtualized";

import { AcceptedFileTypes } from "editor-constants";
import { MediaTrackCue } from "types";
import { MediaTrackTypes } from "editor-constants";
import { createMediaCues, removeObject } from "utils";
import { cloneCues, getSubtitleMarkerCues, validateCue } from "../../utils";
import BlmTextTrackItem from "./item";
import "./styles.scss";

export interface CompProps {
  type: MediaTrackTypes;
  data: MediaTrackCue[];
  currentCue?: MediaTrackCue;
  duration: number;
  elementId?: string;
  className?: string;
  onChange?: (type: MediaTrackTypes, tracks: MediaTrackCue[]) => void;
  onTrackClick?: (track: MediaTrackCue) => void;
  onClickExport?: any;
}

function BlmCueList(props: CompProps) {
  const {
    type,
    data,
    currentCue,
    duration,
    elementId,
    className,
    onTrackClick,
    onChange,
    onClickExport,
  } = props;
  const currentIndex = currentCue ? data.indexOf(currentCue) : -1;
  const fileRef = useRef<HTMLInputElement>(null);

  //To fix chrome display issue
  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        minHeight: 69,
        defaultHeight: 69,
        fixedWidth: true,
      }),
    []
  );

  const getTitle = () => {
    switch (type) {
      case MediaTrackTypes.Subtitles:
        return "Subtitles";
      case MediaTrackTypes.Markers:
        return "Markers";
      case MediaTrackTypes.Labels:
        return "Labels";
      case MediaTrackTypes.Contents:
        return "Content";
    }
  };
  const updateChange = (newData: MediaTrackCue[]) => {
    if (onChange) {
      onChange(type, newData);
    }
  };

  const handleClick = (track: MediaTrackCue) => {
    if (onTrackClick) {
      onTrackClick(track);
    }
  };

  const handleChange = (track: MediaTrackCue, ind: number) => {
    if (0 <= ind && ind < data.length) {
      const newData = cloneCues(data, data[ind], track);

      updateChange(newData);
    }
  };

  const handleDeleteClick = (track: MediaTrackCue) => {
    if (track) {
      const newData = removeObject(data, track);

      updateChange(newData);
    }
  };

  const rowRenderer = (props: ListRowProps) => {
    const { key, parent, index, style } = props;
    const rowData = data[index];
    const next = index >= 0 && index < data.length ? data[index + 1] : undefined;
    const maxTime = next?.startTime ?? duration;

    return (
      <CellMeasurer key={key} cache={cache} parent={parent} columnIndex={0} rowIndex={index}>
        {({ measure, registerChild }) => (
          <BlmTextTrackItem
            ref={registerChild as any}
            type={type}
            data={rowData}
            index={index}
            maxTime={maxTime}
            selected={currentCue === rowData}
            invalid={!validateCue(type, data, rowData)}
            elementId={elementId}
            style={style}
            measure={measure}
            onClick={handleClick}
            onChange={handleChange}
            onDelete={handleDeleteClick}
          />
        )}
      </CellMeasurer>
    );
  };

  const handleImportClick = () => {
    if (fileRef.current) {
      let file = fileRef.current;
      file.click();
      file.value = "";
    }
  };

  const handleExportClick = () => {
    onClickExport(type);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (text) {
          var content = createMediaCues(text as string);
          var validatedContent = getSubtitleMarkerCues(content, duration);

          if (onChange) {
            onChange(type, validatedContent);
          }
        }
      };

      reader.readAsText(event.target.files[0]);
    }
  };

  return (
    <>
      <div className={clsx("cue-list-wrapper", type, className)}>
        <div className="button-wrap">
          <span
            className="import-btn"
            onClick={handleImportClick}
            title={
              type === MediaTrackTypes.Subtitles ? "Import subtitles VTT" : "Import Marker VTT"
            }
          >
            <input
              ref={fileRef}
              type="file"
              accept={AcceptedFileTypes.Vtt}
              className="input-file"
              onChange={handleFileChange}
            />
          </span>
          <span
            className="export-btn"
            onClick={handleExportClick}
            title={
              type === MediaTrackTypes.Subtitles ? "Export subtitles VTT" : "Export Marker VTT"
            }
          />
        </div>
        <div className="cue-list-title">{getTitle()}</div>
        <div className="cue-list">
          <AutoSizer>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
                deferredMeasurementCache={cache}
                rowHeight={cache.rowHeight}
                scrollToIndex={currentIndex}
                rowCount={data.length}
                rowRenderer={rowRenderer}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    </>
  );
}

export default BlmCueList;
