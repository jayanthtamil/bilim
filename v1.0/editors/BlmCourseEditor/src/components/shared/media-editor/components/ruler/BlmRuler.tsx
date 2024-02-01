import React, {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import clamp from "lodash/clamp";

import { MediaWavesurfer } from "types";
import { convertXPosToTime } from "../../utils";
import "./styles.scss";
import { MediaTrackTypes } from "editor-constants";

export interface CompProps {
  type: MediaTrackTypes;
  isPlaying: boolean;
  wavesurfer: MediaWavesurfer;
  onAdd?: (type: MediaTrackTypes, startTime: number, endTime: number) => void;
}

interface DragState {
  status: boolean;
  startX: number;
  endX: number;
}

const initDrag: DragState = { status: false, startX: 0, endX: 0 };

function BlmRuler(props: CompProps) {
  const { type, isPlaying, wavesurfer, onAdd } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(initDrag);
  const [dragged, setDragged] = useState<DragState>();
  const { status, startX, endX } = dragging;
  const { scrollTime, pxPerSec, duration } = wavesurfer;

  useEffect(() => {
    if (dragged) {
      const { startX, endX } = dragged;
      const startTime = clamp(convertXPosToTime(startX, pxPerSec, scrollTime), 0, duration);
      const endTime = clamp(convertXPosToTime(endX, pxPerSec, scrollTime), 0, duration);

      if (startTime >= 0 && endTime > 0 && endTime - startTime >= 0.2) {
        onAdd && onAdd(type, startTime, endTime);
        setDragged(undefined);
      }
    }
  }, [type, dragged, pxPerSec, scrollTime, duration, onAdd]);

  const handleMouseDown = (event: ReactMouseEvent) => {
    if (containerRef.current && !isPlaying) {
      const rect = containerRef.current.getBoundingClientRect();
      const xPos = event.clientX - rect.x;

      setDragging({ status: true, startX: xPos, endX: xPos });

      document.addEventListener("mouseup", handleDocumentMouseUp);
    }
  };

  const handleMouseMove = (event: ReactMouseEvent) => {
    if (dragging.status && containerRef.current && !isPlaying) {
      const rect = containerRef.current.getBoundingClientRect();
      const xPos = event.clientX - rect.x;

      setDragging((state) => ({
        ...state,
        endX: xPos,
      }));
    }
  };

  const handleDocumentMouseUp = useCallback((event: MouseEvent) => {
    setDragging((state) => {
      setDragged(state);

      return { ...initDrag };
    });

    document.removeEventListener("mouseup", handleDocumentMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="ruler-wrapper"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      {!isPlaying && status && startX && endX && endX > startX ? (
        <div
          style={{
            left: startX,
            width: endX - startX,
          }}
          className="ruler-selection-wrapper"
        />
      ) : null}
    </div>
  );
}

export default BlmRuler;
