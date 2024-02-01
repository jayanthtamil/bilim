import React, { KeyboardEvent, MouseEvent, useMemo } from "react";
import clamp from "lodash/clamp";

import { MediaTrackCue, MediaWavesurfer } from "types";
import { MediaCueActions } from "editor-constants";
import { BlmTransformComponent, DragGeometry, MovementConstraint, SizeConstraint } from "shared";
import { convertTimeToXPos, convertXPosToTime } from "../../../utils";
import { useMediaEditorContext } from "../../context";
import "./styles.scss";

export interface TopCueProps {
  data: MediaTrackCue;
  index: number;
  wavesurfer: MediaWavesurfer;
  minTime?: number;
  maxTime?: number;
  onChange?: (oldData: MediaTrackCue, newData: MediaTrackCue) => void;
  onDelete?: (data: MediaTrackCue) => void;
  onTimeChange?: (time: number) => void;
  onContextMenu?: (event: MouseEvent, data: MediaTrackCue) => void;
}

export function BlmTopCue(props: TopCueProps) {
  const {
    data,
    index,
    wavesurfer,
    minTime,
    maxTime,
    onChange,
    onDelete,
    onTimeChange,
    onContextMenu,
  } = props;
  const { topOffset, topMinWidth } = useMediaEditorContext();
  const { startTime, endTime, action } = data;
  const { scrollTime, duration, pxPerSec } = wavesurfer;
  const minimum = minTime !== undefined ? minTime + topOffset : 0;
  const maximum = maxTime !== undefined ? maxTime - topOffset : duration;
  const isPauseContent = action === MediaCueActions.ScrollVPauseC;
  const hasEnd = !isNaN(endTime);

  const model = useMemo(() => {
    const startX = convertTimeToXPos(startTime, pxPerSec, scrollTime);
    const endX = isPauseContent ? convertTimeToXPos(endTime, pxPerSec, scrollTime) : startX;
    const result = new DragGeometry(startX, 0, endX - startX, 22);

    return result;
  }, [startTime, endTime, isPauseContent, pxPerSec, scrollTime]);

  const constraints = useMemo(() => {
    const move = new MovementConstraint(NaN, 0, NaN, 0);
    const size = new SizeConstraint();

    move.minX = convertTimeToXPos(minimum, pxPerSec, scrollTime);
    move.maxX = convertTimeToXPos(maximum, pxPerSec, scrollTime);

    size.minWidth = convertTimeToXPos(topMinWidth, pxPerSec);

    return isPauseContent ? [move, size] : [move];
  }, [minimum, maximum, isPauseContent, topMinWidth, pxPerSec, scrollTime]);

  const updateChange = (newData: MediaTrackCue) => {
    if (onChange) {
      onChange(data, newData);
    }
  };

  const updateTime = (time: number) => {
    if (onTimeChange) {
      onTimeChange(time);
    }
  };

  const updateDelete = () => {
    if (onDelete) {
      onDelete(data);
    }
  };

  const handleChange = (newModel: DragGeometry) => {
    const { x, width } = newModel;
    const newData = { ...data };

    newData.startTime = convertXPosToTime(x, pxPerSec, scrollTime);

    if (hasEnd) {
      if (isPauseContent) {
        newData.endTime = convertXPosToTime(x + width, pxPerSec, scrollTime);
      } else {
        const timeDiff = endTime - startTime;

        newData.endTime = Math.min(
          newData.startTime + timeDiff,
          Math.max(maximum, newData.startTime + 0.1)
        );
      }
    }

    updateChange(newData);
  };

  const handleClick = () => {
    updateTime(startTime + 0.001);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const keyCode = event.keyCode;

    switch (keyCode) {
      case 37:
        updateChange({
          ...data,
          startTime: clamp(startTime - 0.1, minimum, maximum),
          endTime: hasEnd ? clamp(endTime - 0.1, minimum, maximum) : NaN,
        });
        updateTime(startTime - 0.1);
        break;
      case 39:
        updateChange({
          ...data,
          startTime: clamp(startTime + 0.1, minimum, maximum),
          endTime: hasEnd ? clamp(endTime + 0.1, minimum, maximum) : NaN,
        });
        updateTime(startTime + 0.1);
        break;
      case 8:
      case 46:
        updateDelete();
        break;
      default:
        break;
    }
  };

  const handleContextMenu = (event: MouseEvent) => {
    if (onContextMenu) {
      onContextMenu(event, data);
    }
  };

  return (
    <BlmTransformComponent
      tabIndex={index}
      data={model}
      hanldes={isPauseContent ? "e" : undefined}
      constraints={constraints}
      className="top-cue-wrapper"
      onChange={handleChange}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
    />
  );
}

export default BlmTopCue;
