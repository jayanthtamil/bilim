import { CourseElement, Threshold } from "types";
import { ElementType } from "editor-constants";
import { MarkerThreshold } from "./threshold";

export function createMarkers(thresholds: Threshold[]) {
  let markers = [];
  let prevMarker;
  let completion;

  for (let i = 0; i < thresholds.length; i++) {
    const item = thresholds[i];
    const { threshold, ...other } = item;
    const marker: MarkerThreshold = {
      start: threshold,
      end: 100,
      threshold,
      ...other,
    };

    if (prevMarker) {
      prevMarker.end = item.threshold;
    }

    prevMarker = marker;

    if (marker.start !== 100) markers.push(marker);
    else completion = item;
  }

  return { markers, completion };
}

export function getFeedbackElements(element: CourseElement) {
  const arr = element.children;

  if (arr) {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (item.type === ElementType.Feedback) {
        return item.children;
      }
    }
  }
}
