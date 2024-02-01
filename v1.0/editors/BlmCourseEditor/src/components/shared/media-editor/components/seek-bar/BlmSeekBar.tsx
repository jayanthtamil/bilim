import React, { useRef, useEffect, useState, MouseEvent as ReactMouseEvent } from "react";

import { MediaTrackCue } from "types";
import { MediaPlayerTypes } from "editor-constants";
import { formatTime } from "utils";
import { BlmTransformComponent, DragGeometry, MovementConstraint } from "shared";
import "./styles.scss";

export interface CompProps {
  type: MediaPlayerTypes;
  currentTime: number;
  duration: number;
  subtitles: MediaTrackCue[];
  markers: MediaTrackCue[];
  onChange: (time: number) => void;
}

const initModel = new DragGeometry(0, 0, 0, 26);
const HANDLE_WIDTH = 18;

function BlmSeekBar(props: CompProps) {
  const { type, currentTime, duration, subtitles, markers, onChange } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dragModel, setDragModel] = useState<DragGeometry>();
  const wrapperWidth = (wrapperRef.current?.offsetWidth ?? 0) - HANDLE_WIDTH;
  const currentPercentage = currentTime / duration || 0;
  const constraints = [new MovementConstraint(0, 0, wrapperWidth, 0)];
  const model = {
    ...initModel,
    x: currentPercentage * wrapperWidth,
  };

  useEffect(() => {
    if (dragModel) {
      setDragModel(undefined);
    }
  }, [dragModel]);

  const format = (time = 0) => {
    if (type === MediaPlayerTypes.Lottie) {
      return Math.floor(time);
    } else {
      return formatTime(time);
    }
  };

  const updateChange = (time: number) => {
    if (onChange) {
      onChange(time);
    }
  };

  const handleClick = (event: ReactMouseEvent) => {
    const rect = wrapperRef.current?.getBoundingClientRect();

    if (rect) {
      const xPos = event.clientX - rect.x;
      const percentage = Math.min(Math.max(xPos / rect.width, 0), 1);
      const newTime = percentage * duration;

      updateChange(newTime);
    }
  };

  const handleChange = (newModel: DragGeometry) => {
    const newTime = (newModel.x / wrapperWidth) * duration;

    updateChange(newTime);
    setDragModel(newModel);
  };

  return (
    <div className="seekbar-wrapper">
      <div className="seekbar-duration">
        <span>{format(currentTime)}</span>
        <span>{` / ${format(duration)}`}</span>
      </div>
      <div ref={wrapperRef} className="seekbar-pg-wrapper" onClick={handleClick}>
        <div className="seekbar-progress" style={{ width: `${currentPercentage * 100}%` }} />
        <div className="seekbar-handle-wrapper">
          <BlmTransformComponent
            data={dragModel ?? model}
            constraints={constraints}
            className="seekbar-handle"
            onChange={handleChange}
          />
        </div>
        <div className="seekbar-subtitles">
          {subtitles.map((item, index) => {
            return (
              <span
                key={index}
                style={{
                  left: `${(item.startTime / duration) * 100}%`,
                  width: `${((item.endTime - item.startTime) / duration) * 100}%`,
                }}
                className="seekbar-subtitle"
              />
            );
          })}
        </div>
        <div className="seekbar-markers">
          {markers.map((item, index) => {
            return (
              <span
                key={index}
                style={{
                  left: `${(item.startTime / duration) * 100}%`,
                }}
                className="seekbar-marker"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BlmSeekBar;
