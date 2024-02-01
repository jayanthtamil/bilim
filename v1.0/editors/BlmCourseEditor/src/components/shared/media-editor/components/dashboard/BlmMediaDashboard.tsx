import React, { PropsWithChildren, ChangeEvent, MouseEvent } from "react";
import clsx from "clsx";

import { MediaTrackCue } from "types";
import { MediaTrackTypes } from "editor-constants";
import { BlmAutoTextAraa } from "shared";
import { cloneCues } from "../../utils";
import "./styles.scss";

export interface CompProps {
  title: string;
  type: MediaTrackTypes;
  isPlaying: boolean;
  data: MediaTrackCue[];
  currentCue?: MediaTrackCue;
  onClick?: (cue: MediaTrackCue) => void;
  onChange?: (type: MediaTrackTypes, data: MediaTrackCue[]) => void;
}

function BlmMediaDashboard(props: PropsWithChildren<CompProps>) {
  const { title, type, isPlaying, data, currentCue, children, onClick, onChange } = props;

  const updateChange = (newData: MediaTrackCue[]) => {
    if (onChange) {
      onChange(type, newData);
    }
  };

  const handleClick = (event: MouseEvent) => {
    if (currentCue && onClick) {
      onClick(currentCue);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (currentCue) {
      const newData = cloneCues(data, currentCue, { text: event.target.value });

      updateChange(newData);
    }
  };

  return (
    <div className="media-dashboard-wrapper">
      <div className="media-player-title">{title}</div>
      <div className={clsx("media-player-wrapper", { playing: isPlaying })}>
        {children}
        <div className={clsx("media-controls", currentCue?.position)}>
          {currentCue && (
            <BlmAutoTextAraa
              className="subtitle-txt"
              value={currentCue.text}
              onClick={handleClick}
              onChange={handleChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BlmMediaDashboard;
