import React, { MouseEvent } from "react";

import { Marker, MarkerType } from "./types";
import "./marker.scss";

interface CompProps {
  data: Marker;
  isAddable: boolean;
  onMouseEnter: (event: MouseEvent<HTMLDivElement>, type: MarkerType) => void;
  onMouseLeave: (event: MouseEvent<HTMLDivElement>, type: MarkerType) => void;
  onMouseDown: (event: MouseEvent<HTMLDivElement>, type: MarkerType) => void;
  onAddMouseEnter: (event: MouseEvent<HTMLDivElement>) => void;
  onAddMouseLeave: (event: MouseEvent<HTMLDivElement>) => void;
  onAddMouseMove: (event: MouseEvent<HTMLDivElement>) => void;
  onAddClick: (event: MouseEvent<HTMLDivElement>) => void;
}

function BlmMarker(props: CompProps) {
  const {
    data,
    isAddable,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onAddMouseEnter,
    onAddMouseLeave,
    onAddMouseMove,
    onAddClick,
  } = props;
  const { start, end } = data;

  return (
    <div style={{ left: start + "%", right: 100 - end + "%" }} className="marker-wrapper">
      <div className="marker-bg">
        <div
          hidden={!isAddable}
          className="marker-add-bg"
          onMouseEnter={onAddMouseEnter}
          onMouseLeave={onAddMouseLeave}
          onMouseMove={onAddMouseMove}
          onClick={onAddClick}
        />
      </div>
      <div
        className="marker-start"
        onMouseEnter={(event) => onMouseEnter(event, MarkerType.Start)}
        onMouseLeave={(event) => onMouseLeave(event, MarkerType.Start)}
        onMouseDown={(event) => onMouseDown(event, MarkerType.Start)}
      />
      <div
        className="marker-end"
        onMouseEnter={(event) => onMouseEnter(event, MarkerType.End)}
        onMouseLeave={(event) => onMouseLeave(event, MarkerType.End)}
        onMouseDown={(event) => onMouseDown(event, MarkerType.End)}
      />
      <div className="marker-start-lbl">{start}</div>
      <div className="marker-end-lbl">{end}</div>
    </div>
  );
}

export default BlmMarker;
