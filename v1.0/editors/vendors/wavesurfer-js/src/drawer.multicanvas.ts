import { WaveSurferOptions } from "./types";
import * as util from "./utils";
import Drawer from "./drawer";
import CanvasEntry from "./drawer.canvasentry";

export default class MultiCanvas extends Drawer {
  maxCanvasWidth: number;
  maxCanvasElementWidth: number;
  hasProgressCanvas: boolean;
  halfPixel: number;
  canvases: CanvasEntry[];
  progressWave: HTMLElement;
  canvasContextAttributes: object;
  overlap: number;
  barRadius: number;

  constructor(container: HTMLElement, params: WaveSurferOptions) {
    super(container, params);

    this.maxCanvasWidth = params.maxCanvasWidth;
    this.maxCanvasElementWidth = Math.round(
      params.maxCanvasWidth / params.pixelRatio
    );

    this.hasProgressCanvas = params.waveColor !== params.progressColor;
    this.halfPixel = 0.5 / params.pixelRatio;

    this.canvases = [];
    this.progressWave = null!;
    this.canvasContextAttributes = params.drawingContextAttributes;

    this.overlap = 2 * Math.ceil(params.pixelRatio / 2);
    this.barRadius = params.barRadius || 0;
  }

  init() {
    this.createWrapper();
    this.createElements();
  }

  createElements() {
    this.progressWave = this.wrapper.appendChild(
      document.createElement("wave")
    );

    this.style(this.progressWave, {
      position: "absolute",
      zIndex: 3,
      left: 0,
      top: 0,
      bottom: 0,
      overflow: "hidden",
      width: "0",
      display: "none",
      boxSizing: "border-box",
      borderRightStyle: "solid",
      pointerEvents: "none",
    });

    this.addCanvas();
    this.updateCursor();
  }

  updateCursor() {
    this.style(this.progressWave, {
      borderRightWidth: this.params.cursorWidth + "px",
      borderRightColor: this.params.cursorColor,
    });
  }

  updateSize() {
    const totalWidth = Math.round(this.width / this.params.pixelRatio);
    const requiredCanvases = Math.ceil(
      totalWidth / (this.maxCanvasElementWidth + this.overlap)
    );

    // add required canvases
    while (this.canvases.length < requiredCanvases) {
      this.addCanvas();
    }

    // remove older existing canvases, if any
    while (this.canvases.length > requiredCanvases) {
      this.removeCanvas();
    }

    let canvasWidth = this.maxCanvasWidth + this.overlap;
    const lastCanvas = this.canvases.length - 1;

    this.canvases.forEach((entry, i) => {
      if (i === lastCanvas) {
        canvasWidth = this.width - this.maxCanvasWidth * lastCanvas;
      }
      this.updateDimensions(entry, canvasWidth, this.height);

      entry.clearWave();
    });
  }

  addCanvas() {
    const entry = new CanvasEntry();
    entry.canvasContextAttributes = this.canvasContextAttributes;
    entry.hasProgressCanvas = this.hasProgressCanvas;
    entry.halfPixel = this.halfPixel;
    const leftOffset = this.maxCanvasElementWidth * this.canvases.length;

    // wave
    let wave = this.wrapper.appendChild(document.createElement("canvas"));
    this.style(wave, {
      position: "absolute",
      zIndex: 2,
      left: leftOffset + "px",
      top: 0,
      bottom: 0,
      height: "100%",
      pointerEvents: "none",
    });
    entry.initWave(wave);

    // progress
    if (this.hasProgressCanvas) {
      let progress = this.progressWave.appendChild(
        document.createElement("canvas")
      );
      this.style(progress, {
        position: "absolute",
        left: leftOffset + "px",
        top: 0,
        bottom: 0,
        height: "100%",
      });
      entry.initProgress(progress);
    }

    this.canvases.push(entry);
  }

  removeCanvas() {
    let lastEntry = this.canvases[this.canvases.length - 1];

    // wave
    lastEntry.wave.parentElement!.removeChild(lastEntry.wave);

    // progress
    if (this.hasProgressCanvas) {
      lastEntry.progress.parentElement!.removeChild(lastEntry.progress);
    }

    // cleanup
    if (lastEntry) {
      lastEntry.destroy();
      lastEntry = null!;
    }

    this.canvases.pop();
  }

  updateDimensions(entry: CanvasEntry, width: number, height: number) {
    const elementWidth = Math.round(width / this.params.pixelRatio);
    const totalWidth = Math.round(this.width / this.params.pixelRatio);

    // update canvas dimensions
    entry.updateDimensions(elementWidth, totalWidth, width, height);

    // style element
    this.style(this.progressWave, { display: "block" });
  }

  clearWave() {
    util.frame(() => {
      this.canvases.forEach((entry) => entry.clearWave());
    })();
  }

  /**
   * Draw a waveform with bars
   *
   * @param {number[]|Number.<Array[]>} peaks Can also be an array of arrays
   * for split channel rendering
   * @param {number} channelIndex The index of the current channel. Normally
   * should be 0. Must be an integer.
   * @param {number} start The x-offset of the beginning of the area that
   * should be rendered
   * @param {number} end The x-offset of the end of the area that should be
   * rendered
   * @returns {void}
   */
  drawBars(
    peaks: number[] | number[][],
    channelIndex: number,
    start: number,
    end: number
  ) {
    return this.prepareDraw(
      peaks,
      channelIndex,
      start,
      end,
      ({
        absmax,
        hasMinVals,
        height,
        offsetY,
        halfH,
        peaks,
        channelIndex: ch,
      }) => {
        // if drawBars was called within ws.empty we don't pass a start and
        // don't want anything to happen
        if (start === undefined) {
          return;
        }
        // Skip every other value if there are negatives.
        const peakIndexScale = hasMinVals ? 2 : 1;
        const length = peaks.length / peakIndexScale;
        const bar = this.params.barWidth! * this.params.pixelRatio;
        const gap =
          this.params.barGap === null
            ? Math.max(this.params.pixelRatio, ~~(bar / 2))
            : Math.max(
                this.params.pixelRatio,
                this.params.barGap! * this.params.pixelRatio
              );
        const step = bar + gap;

        const scale = length / this.width;
        const first = start;
        const last = end;
        let peakIndex = first;
        for (peakIndex; peakIndex < last; peakIndex += step) {
          // search for the highest peak in the range this bar falls into
          let peak = 0;
          let peakIndexRange = Math.floor(peakIndex * scale) * peakIndexScale; // start index
          const peakIndexEnd =
            Math.floor((peakIndex + step) * scale) * peakIndexScale;
          do {
            // do..while makes sure at least one peak is always evaluated
            const newPeak = Math.abs(peaks[peakIndexRange]); // for arrays starting with negative values
            if (newPeak > peak) {
              peak = newPeak; // higher
            }
            peakIndexRange += peakIndexScale; // skip every other value for negatives
          } while (peakIndexRange < peakIndexEnd);

          // calculate the height of this bar according to the highest peak found
          let h = Math.round((peak / absmax) * halfH);

          // raise the bar height to the specified minimum height
          // Math.max is used to replace any value smaller than barMinHeight (not just 0) with barMinHeight
          if (this.params.barMinHeight) {
            h = Math.max(h, this.params.barMinHeight);
          }

          this.fillRect(
            peakIndex + this.halfPixel,
            halfH - h + offsetY,
            bar + this.halfPixel,
            h * 2,
            this.barRadius,
            ch
          );
        }
      }
    );
  }

  drawWave(
    peaks: number[] | number[][],
    channelIndex: number,
    start: number,
    end: number
  ) {
    return this.prepareDraw(
      peaks,
      channelIndex,
      start,
      end,
      ({ absmax, hasMinVals, height, offsetY, halfH, peaks, channelIndex }) => {
        if (!hasMinVals) {
          const reflectedPeaks = [];
          const len = peaks.length;
          let i = 0;
          for (i; i < len; i++) {
            reflectedPeaks[2 * i] = peaks[i];
            reflectedPeaks[2 * i + 1] = -peaks[i];
          }
          peaks = reflectedPeaks;
        }

        // if drawWave was called within ws.empty we don't pass a start and
        // end and simply want a flat line
        if (start !== undefined) {
          this.drawLine(
            peaks,
            absmax,
            halfH,
            offsetY,
            start,
            end,
            channelIndex
          );
        }

        // always draw a median line
        this.fillRect(
          0,
          halfH + offsetY - this.halfPixel,
          this.width,
          this.halfPixel,
          this.barRadius,
          channelIndex
        );
      }
    );
  }

  drawLine(
    peaks: number[],
    absmax: number,
    halfH: number,
    offsetY: number,
    start: number,
    end: number,
    channelIndex: number
  ) {
    const { waveColor, progressColor } =
      this.params.splitChannelsOptions.channelColors[channelIndex] || {};

    this.canvases.forEach((entry, i) => {
      this.setFillStyles(entry, waveColor, progressColor);

      entry.drawLines(peaks, absmax, halfH, offsetY, start, end);
    });
  }

  fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    channelIndex: number
  ) {
    const startCanvas = Math.floor(x / this.maxCanvasWidth);
    const endCanvas = Math.min(
      Math.ceil((x + width) / this.maxCanvasWidth) + 1,
      this.canvases.length
    );
    let i = startCanvas;
    for (i; i < endCanvas; i++) {
      const entry = this.canvases[i];
      const leftOffset = i * this.maxCanvasWidth;

      const intersection = {
        x1: Math.max(x, i * this.maxCanvasWidth),
        y1: y,
        x2: Math.min(x + width, i * this.maxCanvasWidth + entry.wave.width),
        y2: y + height,
      };

      if (intersection.x1 < intersection.x2) {
        const { waveColor, progressColor } =
          this.params.splitChannelsOptions.channelColors[channelIndex] || {};
        this.setFillStyles(entry, waveColor, progressColor);

        entry.fillRects(
          intersection.x1 - leftOffset,
          intersection.y1,
          intersection.x2 - intersection.x1,
          intersection.y2 - intersection.y1,
          radius
        );
      }
    }
  }

  hideChannel(channelIndex: number) {
    return (
      this.params.splitChannels &&
      this.params.splitChannelsOptions.filterChannels.includes(channelIndex)
    );
  }

  prepareDraw(
    peaks: number[] | number[][],
    channelIndex: number,
    start: number,
    end: number,
    fn: (obj: {
      absmax: number;
      hasMinVals: boolean;
      height: number;
      offsetY: number;
      halfH: number;
      peaks: number[];
      channelIndex: number;
    }) => void,
    drawIndex = 0,
    normalizedMax?: number
  ) {
    return util.frame(() => {
      // Split channels and call this function with the channelIndex set
      if (peaks[0] instanceof Array) {
        const channels = peaks as number[][];

        if (this.params.splitChannels) {
          const filteredChannels = channels.filter(
            (c, i) => !this.hideChannel(i)
          );
          if (!this.params.splitChannelsOptions.overlay) {
            this.setHeight(
              Math.max(filteredChannels.length, 1) *
                this.params.height *
                this.params.pixelRatio
            );
          }

          let overallAbsMax: number;

          if (
            this.params.splitChannelsOptions &&
            this.params.splitChannelsOptions.relativeNormalization
          ) {
            // calculate maximum peak across channels to use for normalization
            overallAbsMax = util.max(
              channels.map((channelPeaks) => util.absMax(channelPeaks))
            );
          }

          return channels.forEach((channelPeaks, i) =>
            this.prepareDraw(
              channelPeaks,
              i,
              start,
              end,
              fn,
              filteredChannels.indexOf(channelPeaks),
              overallAbsMax
            )
          );
        }
        peaks = channels[0];
      }

      // Return and do not draw channel peaks if hidden.
      if (this.hideChannel(channelIndex)) {
        return;
      }

      // calculate maximum modulation value, either from the barHeight
      // parameter or if normalize=true from the largest value in the peak
      // set
      let absmax = 1 / this.params.barHeight;

      if (this.params.normalize) {
        absmax =
          normalizedMax === undefined
            ? util.absMax(peaks as number[])
            : normalizedMax;
      }

      // Bar wave draws the bottom only as a reflection of the top,
      // so we don't need negative values
      const hasMinVals = [].some.call(peaks, (val: number) => val < 0);
      const height = this.params.height * this.params.pixelRatio;
      const halfH = height / 2;

      let offsetY = height * drawIndex || 0;

      // Override offsetY if overlay is true
      if (
        this.params.splitChannelsOptions &&
        this.params.splitChannelsOptions.overlay
      ) {
        offsetY = 0;
      }

      return fn({
        absmax: absmax,
        hasMinVals: hasMinVals,
        height: height,
        offsetY: offsetY,
        halfH: halfH,
        peaks: peaks as number[],
        channelIndex: channelIndex,
      });
    })();
  }

  setFillStyles(
    entry: CanvasEntry,
    waveColor = this.params.waveColor,
    progressColor = this.params.progressColor
  ) {
    entry.setFillStyles(waveColor, progressColor);
  }

  updateProgress(position: number) {
    this.style(this.progressWave, { width: position + "px" });
  }
}
