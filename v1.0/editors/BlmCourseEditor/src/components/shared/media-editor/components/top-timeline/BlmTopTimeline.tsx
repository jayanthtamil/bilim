import React, { memo, useRef, MouseEvent as ReactMouseEvent, useState } from "react";
import { Menu, MenuItem } from "@material-ui/core";

import { MediaTrackCue, MediaWavesurfer } from "types";
import { MediaCueActions, MediaTrackTypes } from "editor-constants";
import { removeObject } from "utils";
import { convertTimeToXPos, getCurrentCues, cloneCues } from "../../utils";
import BlmTopCue from "./cue";
import "./styles.scss";

export interface CompProps {
  type: MediaTrackTypes;
  wavesurfer: MediaWavesurfer;
  data: MediaTrackCue[];
  currentCue?: MediaTrackCue;
  onAdd?: (type: MediaTrackTypes, startTime: number, endTime: number) => void;
  onChange?: (type: MediaTrackTypes, data: MediaTrackCue[]) => void;
  onTimeChange?: (time: number) => void;
}

interface CtxMenu {
  cue?: MediaTrackCue;
  x: number;
  y: number;
}

const initCtx: CtxMenu = { x: 0, y: 0 };

function BlmTopTimeline(props: CompProps) {
  const { type, wavesurfer, data, currentCue, onAdd, onChange, onTimeChange } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctxMenu, setCtxMenu] = useState({ ...initCtx });
  const { currentTime, scrollTime, currentDuration, pxPerSec } = wavesurfer;
  const curCues = getCurrentCues(type, data, scrollTime, currentDuration);
  const isCtxOpen = ctxMenu.cue !== undefined;

  const updateChange = (newData: MediaTrackCue[]) => {
    if (onChange) {
      onChange(type, newData);
    }
  };

  const updateTimeChange = (time: number) => {
    if (onTimeChange) {
      onTimeChange(time);
    }
  };

  const handleAddClick = () => {
    const startTime = currentCue?.startTime ?? 0;
    const endTime =
      currentCue?.action === MediaCueActions.ScrollVPauseC ? currentCue.endTime : startTime + 0.1;

    if (onAdd && (!currentCue || startTime > currentTime || currentTime > endTime))
      onAdd(type, currentTime, NaN);
  };

  const handleChange = (oldCue: MediaTrackCue, newCue: MediaTrackCue) => {
    const newData = cloneCues(data, oldCue, newCue);

    updateChange(newData);
  };

  const handleDelete = (cue: MediaTrackCue) => {
    const newData = removeObject(data, cue);

    updateChange(newData);
  };

  const handleTimeChange = (time: number) => {
    updateTimeChange(time);
  };

  const handleContextMenu = (event: ReactMouseEvent, cue: MediaTrackCue) => {
    event.preventDefault();

    setCtxMenu({ x: event.clientX - 2, y: event.clientY - 4, cue });
  };

  const handleContextItemClick = (item: "delete") => {
    const { cue } = ctxMenu;
    let newData;

    if (cue) {
      if (item === "delete") {
        newData = removeObject(data, cue);
      }

      if (newData) {
        updateChange(newData);
      }
    }

    handleContextMenuClose();
  };

  const handleContextMenuClose = () => {
    setCtxMenu({ ...initCtx });
  };

  const renderChildren = () => {
    return curCues.map((cue, ind) => {
      const previous = ind > 0 && ind <= curCues.length ? curCues[ind - 1] : undefined;
      const next = ind >= 0 && ind < curCues.length ? curCues[ind + 1] : undefined;
      const minTime =
        previous?.action === MediaCueActions.ScrollVPauseC
          ? previous?.endTime
          : previous?.startTime;
      const maxTime = next?.startTime;

      return (
        <BlmTopCue
          key={ind}
          data={cue}
          index={ind}
          wavesurfer={wavesurfer}
          minTime={minTime}
          maxTime={maxTime}
          onChange={handleChange}
          onDelete={handleDelete}
          onTimeChange={handleTimeChange}
          onContextMenu={handleContextMenu}
        />
      );
    });
  };

  return (
    <div ref={containerRef} className="top-timeline-wrapper">
      <div
        style={{ left: convertTimeToXPos(currentTime, pxPerSec, scrollTime) + "px" }}
        className="add-cue-btn"
        onClick={handleAddClick}
      />
      <div className="top-cues-scroller">
        <div className="top-cues-wrapper">{renderChildren()}</div>
      </div>
      <Menu
        keepMounted
        open={isCtxOpen}
        anchorReference="anchorPosition"
        anchorPosition={isCtxOpen ? { top: ctxMenu.y, left: ctxMenu.x } : undefined}
        className="top-timeline-ctx-menu"
        onClose={handleContextMenuClose}
      >
        <MenuItem onClick={(event) => handleContextItemClick("delete")}>Delete</MenuItem>
      </Menu>
    </div>
  );
}

export default memo(BlmTopTimeline);
