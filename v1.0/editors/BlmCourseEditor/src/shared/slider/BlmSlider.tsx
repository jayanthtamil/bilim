import React, { useState, useRef, useEffect, useCallback, MouseEvent } from "react";

import { convertToPercentage, convertFromPercentage } from "utils";
import { useLatest } from "hooks";
import { Marker, MarkerType } from "./types";
import BlmMarker from "./BlmMarker";
import "./slider.scss";

interface CompProps {
  markers: Marker[];
  hasCompletion: boolean;
  onChange: (markers: Marker[]) => void;
  onAddClick: (value: number) => void;
  onRemoveClick: () => void;
  onCompletionClick: (marker: Marker) => void;
}

interface AddState {
  show: boolean;
  x: number;
  value: number;
}

interface RemoveState {
  show: boolean;
  x: number;
}

interface DraggingState {
  status: boolean;
  downPosition: { x: number; y: number };
  marker: {
    original?: Marker;
    type?: MarkerType;
    index?: number;
  };
}

const initAdd: AddState = {
  show: false,
  x: 0,
  value: 0,
};

const initRemove: RemoveState = {
  show: false,
  x: 0,
};

const initDragging: DraggingState = {
  status: false,
  marker: {},
  downPosition: { x: 0, y: 0 },
};

function BlmSlider(props: CompProps) {
  const {
    markers: currentMarkers,
    hasCompletion,
    onChange,
    onAddClick,
    onRemoveClick,
    onCompletionClick,
  } = props;
  const [markers, setMarkers] = useState(currentMarkers);
  const [add, setAdd] = useState(initAdd);
  const [remove, setRemove] = useState(initRemove);
  const trackRef = useRef<HTMLDivElement>(null);
  const markersRef = useLatest(markers);
  const draggingRef = useRef(initDragging);
  const len = markers ? markers.length : 0;

  useEffect(() => {
    setMarkers(currentMarkers);
  }, [currentMarkers]);

  //Dragging markers
  const handleMarkerMouseDown = (
    event: MouseEvent<HTMLElement>,
    type: MarkerType,
    marker: Marker,
    index: number
  ) => {
    if (index === len - 1 && type === MarkerType.End) {
      onCompletionClick(marker);
    } else {
      draggingRef.current = {
        status: true,
        marker: {
          original: { ...marker },
          index,
          type,
        },
        downPosition: { x: event.pageX, y: event.pageY },
      };

      addDraggingDocumentListeners();

      event.stopPropagation();
      event.preventDefault();

      toggleRemove(false);
    }
  };

  const handleDocumentMouseMove = useCallback(
    (event) => {
      const { status, marker, downPosition } = draggingRef.current;
      const arr = markersRef.current;

      if (!status || !trackRef.current) return;

      const { original, type, index } = marker;
      const deltaX = event.pageX - downPosition.x;
      const containerWidth = trackRef.current.offsetWidth;

      if (original && index !== undefined) {
        const { start, end } = original;
        const current = arr[index];
        const sibling = type === MarkerType.Start ? arr[index - 1] : arr[index + 1];

        if (type === MarkerType.Start && index !== 0) {
          const startX = convertFromPercentage(start, containerWidth);
          let startVal = Math.round(convertToPercentage(startX + deltaX, containerWidth));

          startVal = Math.min(100, end - 1, Math.max(0, startVal, sibling.start + 1));

          current.start = startVal;
          sibling.end = current.start;
        } else if (type === MarkerType.End && index !== arr.length - 1) {
          const endX = convertFromPercentage(original.end, containerWidth);
          let endVal = Math.round(convertToPercentage(endX + deltaX, containerWidth));

          endVal = Math.min(100, sibling.end - 1, Math.max(0, start + 1, endVal));

          current.end = endVal;
          sibling.start = current.end;
        }
      }

      event.stopPropagation();
      event.preventDefault();

      setMarkers([...arr]);
    },
    [markersRef, setMarkers]
  );

  const handleDocumentMouseUp = useCallback(
    (event) => {
      draggingRef.current = { ...initDragging };

      document.removeEventListener("mousemove", handleDocumentMouseMove);
      document.removeEventListener("mouseup", handleDocumentMouseUp);

      event.stopPropagation();
      event.preventDefault();

      if (onChange) {
        onChange([...markersRef.current]);
      }
    },
    [markersRef, onChange, handleDocumentMouseMove]
  );

  const addDraggingDocumentListeners = () => {
    document.addEventListener("mousemove", handleDocumentMouseMove);
    document.addEventListener("mouseup", handleDocumentMouseUp);
  };

  //Add marker
  const handleAddMouseEnter = (event: MouseEvent<HTMLElement>) => {
    if (!add.show) {
      startAdding(event);
    }
  };

  const handleAddMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (add.show) {
      toggleAdd(true, getTrackMouseX(event));
    }
  };

  const handleAddMouseLeave = (event: MouseEvent<HTMLElement>) => {
    if (add.show) {
      stopAdding();
    }
  };

  const handleAddClick = (event: MouseEvent<HTMLElement>) => {
    stopAdding();

    if (onAddClick) {
      onAddClick(add.value);
    }
  };

  const startAdding = (event: MouseEvent<HTMLElement>) => {
    toggleAdd(true, getTrackMouseX(event));
  };

  const stopAdding = () => {
    toggleAdd(false);
  };

  const getTrackMouseX = (event: MouseEvent<HTMLElement>) => {
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const mouseX = event.pageX - rect.x;

      return mouseX;
    }
    return 0;
  };

  const toggleAdd = (show: boolean, xPos?: number) => {
    let x = xPos ? xPos : add.x;
    let value;

    x = Math.min(trackRef.current ? trackRef.current.offsetWidth : 0, Math.max(0, x));
    value = convertXAxisToValue(x);

    setAdd({
      show,
      x,
      value,
    });
  };

  const convertXAxisToValue = (xPos: number) => {
    if (trackRef.current) {
      const containerWidth = trackRef.current.offsetWidth;
      let xValue = convertToPercentage(xPos, containerWidth);

      return Math.round(xValue);
    }
    return xPos;
  };

  //Remove marker
  const handleMarkerMouseEnter = (
    event: MouseEvent<HTMLElement>,
    type: MarkerType,
    marker: Marker,
    index: number
  ) => {
    if (draggingRef.current.status) {
      return;
    }

    if (
      len > 2 &&
      index < 2 &&
      ((index === 0 && type !== "start") || (index === 1 && type !== "end"))
    ) {
      const xPos = type === "start" ? marker.start : marker.end;

      toggleRemove(true, xPos);
    }
  };

  const handleMarkerMouseLeave = (
    event: MouseEvent<HTMLElement>,
    type: MarkerType,
    marker: Marker,
    index: number
  ) => {
    if (remove.show) {
      toggleRemove(false);
    }
  };

  const handleRemoveMouseEnter = (event: MouseEvent<HTMLElement>) => {
    if (draggingRef.current.status) {
      return;
    }

    toggleRemove(true);
  };

  const handleRemoveMouseLeave = (event: MouseEvent<HTMLElement>) => {
    if (remove.show) {
      toggleRemove(false);
    }
  };

  const handleRemoveClick = (event: MouseEvent<HTMLElement>) => {
    toggleRemove(false);

    if (onRemoveClick) {
      onRemoveClick();
    }
  };

  const toggleRemove = (show: boolean, x?: number) => {
    setRemove({
      x: x ? x : remove.x,
      show: show,
    });
  };

  const renderMarkers = () => {
    if (markers) {
      return markers.map((marker, index) => {
        const isAddable = !draggingRef.current.status && len === 2 && index === 0;

        return (
          <BlmMarker
            key={index}
            data={marker}
            isAddable={isAddable}
            onMouseEnter={(event, type) => handleMarkerMouseEnter(event, type, marker, index)}
            onMouseLeave={(event, type) => handleMarkerMouseLeave(event, type, marker, index)}
            onMouseDown={(event, type) => handleMarkerMouseDown(event, type, marker, index)}
            onAddMouseEnter={handleAddMouseEnter}
            onAddMouseMove={handleAddMouseMove}
            onAddMouseLeave={handleAddMouseLeave}
            onAddClick={handleAddClick}
          />
        );
      });
    }
  };

  return (
    <div className="slider-container">
      <div ref={trackRef} className="slider-track">
        <div
          hidden={!remove.show}
          style={{ left: remove.x + "%" }}
          className="slider-remove-zone"
          onMouseEnter={handleRemoveMouseEnter}
          onMouseLeave={handleRemoveMouseLeave}
        >
          <div className="slider-remove-btn" onClick={handleRemoveClick} />
        </div>
        <div className="slider-markers-container">{renderMarkers()}</div>
        <div
          hidden={!hasCompletion}
          className="slider-completion-icon"
          onClick={(event) => onCompletionClick(markers[markers.length - 1])}
        />
        <div hidden={!add.show} style={{ left: add.x + "px" }} className="slider-add-lbl">
          {add.value}
        </div>
      </div>
    </div>
  );
}

export default BlmSlider;
