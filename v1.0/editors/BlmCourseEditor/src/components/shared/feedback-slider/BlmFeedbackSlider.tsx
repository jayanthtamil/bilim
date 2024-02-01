import React, { MouseEvent, HTMLAttributes } from "react";

import { CourseElement, Threshold } from "types";
import { BlmSlider, Marker } from "shared";
import BlmThreshold, { MarkerThreshold } from "./threshold";
import { createMarkers, getFeedbackElements } from "./utils";
import "./feedback-slider.scss";

interface CompProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  element: CourseElement;
  thresholds: Threshold[];
  onChange?: (threshols: Threshold[]) => void;
}

function BlmFeedbackSlider(props: CompProps) {
  const { element, thresholds, onChange, ...others } = props;
  const { markers, completion } = createMarkers(thresholds);
  const fbElements = getFeedbackElements(element);
  const hasCompletion = completion ? true : false;
  const hasAddBtn = markers.length <= 2;

  const updateChange = (newThresholds: Threshold[]) => {
    if (onChange) {
      onChange(newThresholds);
    }
  };

  const addThreshold = (value: number) => {
    const len = thresholds ? thresholds.length : 0;

    if ((completion && len === 3) || (!completion && len === 2)) {
      const [first, last, ...other] = thresholds;

      if (first.threshold < value && value < last.threshold) {
        const middle = { threshold: value, feedback: "" };
        const newThresholds = [first, middle, last, ...other];

        updateChange(newThresholds);
      }
    }
  };

  const removeThreshold = () => {
    const len = thresholds.length;

    if ((completion && len === 4) || (!completion && len === 3)) {
      const [first, , ...other] = thresholds;
      const newThresholds = [first, ...other];

      updateChange(newThresholds);
    }
  };

  const handleChange = (newMarkers: Marker[]) => {
    let newThresholds;

    newThresholds = newMarkers.map((marker) => {
      const { start, end, ...other } = marker;
      const threshold = { ...other, threshold: start } as Threshold;

      return threshold;
    });

    if (completion) {
      newThresholds.push({
        ...completion,
      });
    }

    updateChange(newThresholds);
  };

  const handleThresholdFbChange = (newMarker: MarkerThreshold | Threshold) => {
    if (!("start" in newMarker)) {
      if (completion) {
        const newCompletionThreshold = {
          ...completion,
          feedback: newMarker.feedback,
        };
        let newThresholds;

        thresholds.splice(thresholds.length - 1, 1);
        newThresholds = [...thresholds, newCompletionThreshold];
        updateChange(newThresholds);
      }
    } else {
      const newMarkers = markers.map((marker) => {
        if (marker.start === newMarker.start) {
          return { ...marker, feedback: newMarker.feedback };
        }
        return { ...marker };
      });

      handleChange(newMarkers);
    }
  };

  const handleAddClick = (value: number | MouseEvent) => {
    if (typeof value !== "number") {
      const [first, second] = thresholds;
      value = Math.round((second.threshold - first.threshold) / 2);
    }
    addThreshold(value);
  };

  const handleRemoveClick = () => {
    removeThreshold();
  };

  const handleCompletionClick = () => {
    const len = thresholds.length;
    if (len > 0) {
      const last = thresholds[len - 1];
      let newThresholds;

      if (!completion) {
        if (last.threshold !== 100) {
          newThresholds = [
            ...thresholds,
            {
              threshold: 100,
              feedback: "",
            },
          ];

          updateChange(newThresholds);
        }
      } else {
        if (last.threshold === 100) {
          thresholds.splice(len - 1, 1);
          newThresholds = [...thresholds];

          updateChange(newThresholds);
        }
      }
    }
  };

  return (
    <div className="feedback-slider-wrapper" {...others}>
      <BlmSlider
        markers={markers}
        hasCompletion={hasCompletion}
        onChange={handleChange}
        onAddClick={handleAddClick}
        onRemoveClick={handleRemoveClick}
        onCompletionClick={handleCompletionClick}
      />
      <BlmThreshold data={markers[0]} elements={fbElements} onChange={handleThresholdFbChange} />
      {hasAddBtn ? (
        <div className="add-threshold-btn" onClick={handleAddClick} />
      ) : (
        <BlmThreshold data={markers[1]} elements={fbElements} onChange={handleThresholdFbChange} />
      )}
      <BlmThreshold
        data={markers[markers.length - 1]}
        elements={fbElements}
        onChange={handleThresholdFbChange}
      />
      {hasCompletion ? (
        <BlmThreshold data={completion} elements={fbElements} onChange={handleThresholdFbChange} />
      ) : (
        <div className="add-threshold-btn" onClick={handleCompletionClick} />
      )}
    </div>
  );
}

export default BlmFeedbackSlider;
