import WaveSurfer from "./wavesurfer";

export interface WaveSurferOptions {
  autoCenter: boolean;
  autoCenterRate: number;
  autoCenterImmediately: boolean;
  backgroundColor: string | null;
  barHeight: number;
  barRadius: number;
  barGap?: number;
  barWidth?: number;
  barMinHeight?: number;
  container: string | HTMLDivElement;
  cursorColor: string;
  cursorWidth: number;
  drawingContextAttributes: {
    desynchronized: boolean;
  };
  fillParent: boolean;
  height: number;
  hideScrollbar: boolean;
  hideCursor: boolean;
  maxCanvasWidth: number;
  minPxPerSec: number;
  normalize: boolean;
  pixelRatio: number;
  plugins: PluginDefinition[];
  progressColor: string;
  responsive: boolean;
  scrollParent: boolean;
  splitChannels: boolean;
  splitChannelsOptions: SplitChannelsOptions;
  waveColor: string;
}

export interface SplitChannelsOptions {
  overlay: false;
  channelColors: {
    [key: number]: {
      waveColor: string;
      progressColor: string;
    };
  };
  filterChannels: number[];
  relativeNormalization: boolean;
  splitDragSelection: boolean;
}

export interface PluginDefinition {
  name: string;
  staticProps?: Object;
  deferInit?: boolean;
  params: Object;
  instance: PluginClass;
}

export class PluginClass {
  create(params: Object) {}

  constructor(params: Object, ws: WaveSurfer) {}

  init() {}

  destroy() {}
}
