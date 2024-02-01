import { WaveSurferOptions } from "./types";
import * as util from "./utils";

export default class Drawer extends util.Observer {
  container: HTMLElement;
  params: WaveSurferOptions;
  width: number;
  height: number;
  lastPos: number;
  wrapper: HTMLElement;

  constructor(container: HTMLElement, params: WaveSurferOptions) {
    super();

    this.container = container;
    this.params = params;
    this.width = 0;
    this.height = params.height * this.params.pixelRatio;
    this.lastPos = 0;

    this.wrapper = null!;
  }

  style(el: HTMLElement, styles: { [key: string]: any }) {
    return util.style(el, styles);
  }

  createWrapper() {
    this.wrapper = this.container.appendChild(document.createElement("wave"));

    this.style(this.wrapper, {
      display: "block",
      position: "relative",
      userSelect: "none",
      webkitUserSelect: "none",
      height: this.params.height + "px",
    });

    if (this.params.fillParent || this.params.scrollParent) {
      this.style(this.wrapper, {
        width: "100%",
        cursor: this.params.hideCursor ? "none" : "auto",
        overflowX: this.params.hideScrollbar ? "hidden" : "auto",
        overflowY: "hidden",
      });
    }
  }

  drawPeaks(
    peaks: number[] | Array<number[]>,
    length: number,
    start: number,
    end: number
  ) {
    if (!this.setWidth(length)) {
      this.clearWave();
    }

    this.params.barWidth
      ? this.drawBars(peaks, 0, start, end)
      : this.drawWave(peaks, 0, start, end);
  }

  resetScroll() {
    if (this.wrapper !== null) {
      this.wrapper.scrollLeft = 0;
    }
  }

  recenter(percent: number) {
    const position = this.wrapper.scrollWidth * percent;

    this.recenterOnPosition(position, true);
  }

  recenterOnPosition(position: number, immediate: boolean) {
    const scrollLeft = this.wrapper.scrollLeft;
    const half = ~~(this.wrapper.clientWidth / 2);
    const maxScroll = this.wrapper.scrollWidth - this.wrapper.clientWidth;
    let target = position - half;
    let offset = target - scrollLeft;

    if (maxScroll === 0) {
      // no need to continue if scrollbar is not there
      return;
    }

    // if the cursor is currently visible...
    if (!immediate && -half <= offset && offset < half) {
      // set rate at which waveform is centered
      let rate = this.params.autoCenterRate;

      // make rate depend on width of view and length of waveform
      rate /= half;
      rate *= maxScroll;

      offset = Math.max(-rate, Math.min(rate, offset));
      target = scrollLeft + offset;
    }

    // limit target to valid range (0 to maxScroll)
    target = Math.max(0, Math.min(maxScroll, target));

    // no use attempting to scroll if we're not moving
    if (target !== scrollLeft) {
      this.wrapper.scrollLeft = target;
    }
  }

  getScrollX() {
    let x = 0;
    if (this.wrapper) {
      const pixelRatio = this.params.pixelRatio;
      x = Math.round(this.wrapper.scrollLeft * pixelRatio);

      // In cases of elastic scroll (safari with mouse wheel) you can
      // scroll beyond the limits of the container
      // Calculate and floor the scrollable extent to make sure an out
      // of bounds value is not returned
      // Ticket #1312
      if (this.params.scrollParent) {
        const maxScroll = ~~(
          this.wrapper.scrollWidth * pixelRatio -
          this.getWidth()
        );

        x = Math.min(maxScroll, Math.max(0, x));
      }
    }

    return x;
  }

  getWidth() {
    return Math.round(this.container.clientWidth * this.params.pixelRatio);
  }

  setWidth(width: number) {
    if (this.width === width) {
      return false;
    }

    this.width = width;

    if (this.params.fillParent || this.params.scrollParent) {
      this.style(this.wrapper, {
        width: "",
      });
    } else {
      const newWidth = ~~(this.width / this.params.pixelRatio) + "px";

      this.style(this.wrapper, {
        width: newWidth,
      });
    }

    this.updateSize();

    return true;
  }

  setHeight(height: number) {
    if (height === this.height) {
      return false;
    }

    this.height = height;

    this.style(this.wrapper, {
      height: ~~(this.height / this.params.pixelRatio) + "px",
    });

    this.updateSize();

    return true;
  }

  progress(progress: number) {
    const minPxDelta = 1 / this.params.pixelRatio;
    const pos = Math.round(progress * this.width) * minPxDelta;

    if (pos < this.lastPos || pos - this.lastPos >= minPxDelta) {
      this.lastPos = pos;

      if (this.params.scrollParent && this.params.autoCenter) {
        const newPos = ~~(this.wrapper.scrollWidth * progress);
        this.recenterOnPosition(newPos, this.params.autoCenterImmediately);
      }

      this.updateProgress(pos);
    }
  }

  destroy() {
    this.unAll();

    if (this.wrapper) {
      if (this.wrapper.parentNode === this.container) {
        this.container.removeChild(this.wrapper);
      }

      this.wrapper = null!;
    }
  }

  updateCursor() {}

  updateSize() {}

  drawBars(
    peaks: number[] | number[][],
    channelIndex: number,
    start: number,
    end: number
  ) {}

  drawWave(
    peaks: number[] | number[][],
    channelIndex: number,
    start: number,
    end: number
  ) {}

  clearWave() {}

  updateProgress(position: number) {}
}
