import React, { useMemo, KeyboardEvent, MouseEvent } from "react";
import clamp from "lodash/clamp";
import clsx from "clsx";

import { MediaTrackCue, MediaWavesurfer } from "types";
import { BlmTransformComponent, DragGeometry, MovementConstraint, SizeConstraint } from "shared";
import { convertTimeToXPos, convertXPosToTime } from "../../../utils";
import { useMediaEditorContext } from "../../context";
import "./styles.scss";

export interface MainCueProps {
  data: MediaTrackCue;
  index: number;
  wavesurfer: MediaWavesurfer;
  minTime?: number;
  maxTime?: number;
  selected?: boolean;
  invalid?: boolean;
  onChange?: (oldData: MediaTrackCue, newData: MediaTrackCue) => void;
  onDelete?: (data: MediaTrackCue) => void;
  onTimeChange?: (time: number) => void;
  onContextMenu?: (event: MouseEvent, data: MediaTrackCue) => void;
}

function BlmMainCue(props: MainCueProps) {
  const {
    data,
    index,
    wavesurfer,
    minTime,
    maxTime,
    selected,
    invalid,
    onChange,
    onDelete,
    onTimeChange,
    onContextMenu,
  } = props;
  const { mainOffset, mainMinWidth } = useMediaEditorContext();
  const { startTime, endTime, text } = data;
  const { scrollTime, duration, pxPerSec } = wavesurfer;
  const minimum = minTime !== undefined ? minTime + mainOffset : 0;
  const maximum = maxTime !== undefined ? maxTime - mainOffset : duration;

  const model = useMemo(() => {
    const startX = convertTimeToXPos(startTime, pxPerSec, scrollTime);
    const endX = convertTimeToXPos(endTime, pxPerSec, scrollTime);
    const result = new DragGeometry(startX, 38, endX - startX, 141);

    return result;
  }, [startTime, endTime, pxPerSec, scrollTime]);

  const constraints = useMemo(() => {
    const move = new MovementConstraint(NaN, 38, NaN, 38);
    const size = new SizeConstraint();

    move.minX = convertTimeToXPos(minimum, pxPerSec, scrollTime);
    move.maxX = convertTimeToXPos(maximum, pxPerSec, scrollTime);

    size.minWidth = convertTimeToXPos(mainMinWidth, pxPerSec);

    return [move, size];
  }, [minimum, maximum, mainMinWidth, pxPerSec, scrollTime]);

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
    newData.endTime = convertXPosToTime(x + width, pxPerSec, scrollTime);

    updateChange(newData);
  };

  const handleClick = () => {
    updateTime(startTime + 0.001);
  };

  const handleDoubleClick = () => {
    const newData = {
      ...data,
      startTime: minTime ? minimum : startTime,
      endTime: maxTime ? maximum : endTime,
    };

    updateChange(newData);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const keyCode = event.keyCode;

    switch (keyCode) {
      case 37:
        updateChange({
          ...data,
          startTime: clamp(startTime - 0.1, minimum, maximum),
          endTime: clamp(endTime - 0.1, minimum, maximum),
        });
        updateTime(startTime - 0.1);
        break;
      case 39:
        updateChange({
          ...data,
          startTime: clamp(startTime + 0.1, minimum, maximum),
          endTime: clamp(endTime + 0.1, minimum, maximum),
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
      hanldes="w,e"
      constraints={constraints}
      className={clsx("main-cue-wrapper", { selected, invalid })}
      onChange={handleChange}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
    >
      <div className="main-cue-lbl">{text}</div>
    </BlmTransformComponent>
  );
}

export default BlmMainCue;
