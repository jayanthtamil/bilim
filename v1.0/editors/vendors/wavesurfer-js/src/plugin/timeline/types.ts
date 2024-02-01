export interface TimelinePluginParams {
  container: string | HTMLElement;
  notchPercentHeight: number;
  unlabeledNotchColor: string;
  primaryColor: string;
  secondaryColor: string;
  primaryFontColor: string;
  secondaryFontColor: string;
  labelPadding: number;
  zoomDebounce?: number;
  fontFamily: string;
  fontSize: number;
  height: number;
  duration?: number;
  offset?: number;
  deferInit?: boolean;
  formatTimeCallback: (sec: number, pxPerSec: number) => string;
  timeInterval: (pxPerSec: number) => string;
  primaryLabelInterval: (pxPerSec: number) => number;
  secondaryLabelInterval: (pxPerSec: number) => number;
}
