import React, { MouseEvent as ReactMouseEvent, useState, useRef, useCallback } from "react";
import clsx from "clsx";
import clamp from "lodash/clamp";

import { MediaWavesurfer } from "types";
import { convertXPosToTime } from "../../utils";
import "./styles.scss";

export interface CompProps {
  wavesurfer: MediaWavesurfer;
  onChange?: (time: number) => void;
}

function BlmWaveScroller(props: CompProps) {
  const { wavesurfer, onChange } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState({ status: false, startX: 0, startTime: 0 });
  const { currentTime, duration } = wavesurfer;

  const updateChange = (time: number) => {
    if (onChange) {
      onChange(time);
    }
  };

  const handleMouseDown = (event: ReactMouseEvent) => {
    setScrolling({ status: true, startX: event.pageX, startTime: currentTime });

    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: ReactMouseEvent) => {
    const { status, startX, startTime } = scrolling;
    const container = containerRef.current;

    if (status && container) {
      const newTime = clamp(
        startTime - convertXPosToTime(event.pageX - startX, wavesurfer.pxPerSec),
        0,
        duration
      );

      updateChange(newTime);
    }
  };

  const handleMouseUp = useCallback((event: MouseEvent) => {
    setScrolling({ status: false, startX: 0, startTime: 0 });

    document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx("wave-scroller", { scrolling: scrolling.status })}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    />
  );
}

export default BlmWaveScroller;
