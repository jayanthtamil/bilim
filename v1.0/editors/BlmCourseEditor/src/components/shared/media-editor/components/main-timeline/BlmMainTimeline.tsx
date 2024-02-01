import React, { memo, useRef, MouseEvent as ReactMouseEvent, useState, CSSProperties } from "react";
import { Menu, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { MediaTrackCue, MediaWavesurfer } from "types";
import { MediaTrackTypes } from "editor-constants";
import { removeObject } from "utils";
import { cloneCues, getCurrentCues, validateCue } from "../../utils";
import BlmMainCue from "./cue";
import "./styles.scss";

export interface CompProps {
  type: MediaTrackTypes;
  wavesurfer: MediaWavesurfer;
  data: MediaTrackCue[];
  onChange?: (type: MediaTrackTypes, data: MediaTrackCue[]) => void;
  onTimeChange?: (time: number) => void;
}

interface CtxMenu {
  cue?: MediaTrackCue;
  x: number;
  y: number;
}

const initCtx: CtxMenu = { x: 0, y: 0 };

function BlmMainTimeline(props: CompProps) {
  const { type, wavesurfer, data, onChange, onTimeChange } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctxMenu, setCtxMenu] = useState({ ...initCtx });
  const { currentTime, scrollTime, currentDuration } = wavesurfer;
  const curCues = getCurrentCues(type, data, scrollTime, currentDuration);
  const startInd = data.indexOf(curCues[0]);
  const isCtxOpen = ctxMenu.cue !== undefined;
  const { t } = useTranslation("shared");

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

  const handleContextMenuClose = () => {
    setCtxMenu({ ...initCtx });
  };

  const handleContextItemClick = (item: "merge" | "delete") => {
    const { cue } = ctxMenu;
    let newData;

    if (cue) {
      if (item === "delete") {
        newData = removeObject(data, cue);
      } else if (item === "merge") {
        const ind = data.indexOf(cue);
        const next = data[ind + 1];

        if (next) {
          newData = cloneCues(data, cue, {
            endTime: next.endTime,
            text: cue.text + "\n" + next.text,
          });
          newData.splice(ind + 1, 1);
        }
      }

      if (newData) {
        updateChange(newData);
      }
    }

    handleContextMenuClose();
  };

  const renderChildren = () => {
    return curCues.map((cue, ind) => {
      const previous = ind > 0 && ind <= curCues.length ? curCues[ind - 1] : undefined;
      const next = ind >= 0 && ind < curCues.length ? curCues[ind + 1] : undefined;

      return (
        <BlmMainCue
          key={ind}
          data={cue}
          index={ind}
          wavesurfer={wavesurfer}
          minTime={previous?.endTime}
          maxTime={next?.startTime}
          selected={cue.startTime <= currentTime && currentTime < cue.endTime}
          invalid={!validateCue(type, data, cue)}
          onChange={handleChange}
          onDelete={handleDelete}
          onTimeChange={handleTimeChange}
          onContextMenu={handleContextMenu}
        />
      );
    });
  };

  return (
    <div
      ref={containerRef}
      style={
        {
          "--start-ind": startInd,
        } as CSSProperties
      }
      className="main-timeline-wrapper"
    >
      {renderChildren()}
      <Menu
        keepMounted
        open={isCtxOpen}
        anchorReference="anchorPosition"
        anchorPosition={isCtxOpen ? { top: ctxMenu.y, left: ctxMenu.x } : undefined}
        className="main-timeline-ctx-menu"
        onClose={handleContextMenuClose}
      >
        <MenuItem onClick={(event) => handleContextItemClick("delete")}>
          {t("main_timeline.delete")}
        </MenuItem>
        <MenuItem onClick={(event) => handleContextItemClick("merge")}>
          {t("main_timeline.merge")}
        </MenuItem>
      </Menu>
    </div>
  );
}

export default memo(BlmMainTimeline);
