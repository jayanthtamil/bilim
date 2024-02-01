import { Threshold } from "types";

export function getScoreThreshold(thresholds: Threshold[]) {
  if (thresholds) {
    for (let i = thresholds.length - 1; i >= 0; i--) {
      var item = thresholds[i];
      if (item.threshold !== 100) {
        return item;
      }
    }
  }
}
