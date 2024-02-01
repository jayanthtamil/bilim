import debounce from "lodash/debounce";

import { TimelinePluginParams } from "./types";
import * as utils from "../../utils";
import WaveSurfer from "../../wavesurfer";
import Drawer from "../../drawer";

export default class TimelinePlugin extends utils.Observer {
  container: HTMLElement;
  wavesurfer: WaveSurfer;
  params: TimelinePluginParams;
  wrapper: HTMLElement;
  drawer: Drawer;
  canvases: HTMLCanvasElement[];
  pixelRatio: number;
  maxCanvasWidth: number;
  maxCanvasElementWidth: number;
  _onZoom: () => void | ReturnType<typeof debounce>;

  static create(params: Partial<TimelinePluginParams>) {
    return {
      name: "timeline",
      deferInit: params && params.deferInit ? params.deferInit : false,
      params: params,
      instance: TimelinePlugin,
    };
  }

  constructor(params: TimelinePluginParams, ws: WaveSurfer) {
    super();

    this.container =
      "string" == typeof params.container
        ? document.querySelector(params.container)!
        : params.container;

    if (!this.container) {
      throw new Error("No container for wavesurfer timeline");
    }

    this.wavesurfer = ws;
    this.params = Object.assign(
      {},
      {
        height: 20,
        notchPercentHeight: 90,
        labelPadding: 5,
        unlabeledNotchColor: "#c0c0c0",
        primaryColor: "#000",
        secondaryColor: "#c0c0c0",
        primaryFontColor: "#000",
        secondaryFontColor: "#000",
        fontFamily: "Arial",
        fontSize: 10,
        duration: null,
        zoomDebounce: false,
        formatTimeCallback: this.defaultFormatTimeCallback,
        timeInterval: this.defaultTimeInterval,
        primaryLabelInterval: this.defaultPrimaryLabelInterval,
        secondaryLabelInterval: this.defaultSecondaryLabelInterval,
        offset: 0,
      },
      params
    );

    this.canvases = [];
    this.wrapper = null!;
    this.drawer = null!;
    this.pixelRatio = null!;
    this.maxCanvasWidth = null!;
    this.maxCanvasElementWidth = null!;

    this._onZoom = this.params.zoomDebounce
      ? debounce(() => this.render(), this.params.zoomDebounce)
      : () => this.render();
  }

  // event handlers
  _onScroll = () => {
    if (this.wrapper && this.drawer.wrapper) {
      this.wrapper.scrollLeft = this.drawer.wrapper.scrollLeft;
    }
  };

  _onRedraw = () => this.render();

  _onReady = () => {
    const ws = this.wavesurfer;

    this.drawer = ws.drawer;
    this.pixelRatio = ws.drawer.params.pixelRatio;
    this.maxCanvasWidth = ws.drawer.maxCanvasWidth || ws.drawer.width;
    this.maxCanvasElementWidth =
      ws.drawer.maxCanvasElementWidth ||
      Math.round(this.maxCanvasWidth / this.pixelRatio);

    // add listeners
    ws.drawer.wrapper.addEventListener("scroll", this._onScroll);
    ws.on("redraw", this._onRedraw);
    ws.on("zoom", this._onZoom);

    this.render();
  };

  _onWrapperClick = (e: MouseEvent) => {
    e.preventDefault();
    //@ts-ignore
    const relX = "offsetX" in e ? e.offsetX : e.layerX;
    this.fireEvent("click", relX / this.wrapper.scrollWidth || 0);
  };

  init() {
    if (this.wavesurfer.isReady) {
      this._onReady();
    } else {
      this.wavesurfer.once("ready", this._onReady);
    }
  }

  destroy() {
    this.unAll();
    this.wavesurfer.un("redraw", this._onRedraw);
    this.wavesurfer.un("zoom", this._onZoom);
    this.wavesurfer.un("ready", this._onReady);
    this.wavesurfer.drawer.wrapper.removeEventListener(
      "scroll",
      this._onScroll
    );

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.removeEventListener("click", this._onWrapperClick);
      this.wrapper.parentNode.removeChild(this.wrapper);
      this.wrapper = null!;
    }
  }

  createWrapper() {
    const wsParams = this.wavesurfer.params;

    this.container.innerHTML = "";
    this.wrapper = this.container.appendChild(
      document.createElement("timeline")
    );

    utils.style(this.wrapper, {
      display: "block",
      position: "relative",
      userSelect: "none",
      webkitUserSelect: "none",
      height: `${this.params.height}px`,
    });

    if (wsParams.fillParent || wsParams.scrollParent) {
      utils.style(this.wrapper, {
        width: "100%",
        overflowX: "hidden",
        overflowY: "hidden",
      });
    }

    this.wrapper.addEventListener("click", this._onWrapperClick);
  }

  render() {
    if (!this.wrapper) {
      this.createWrapper();
    }
    this.updateCanvases();
    this.updateCanvasesPositioning();
    this.renderCanvases();
  }

  addCanvas() {
    const canvas = this.wrapper.appendChild(document.createElement("canvas"));

    this.canvases.push(canvas);

    utils.style(canvas, {
      position: "absolute",
      zIndex: 4,
    });
  }

  removeCanvas() {
    const canvas = this.canvases.pop();

    canvas && canvas.parentElement!.removeChild(canvas);
  }

  updateCanvases() {
    const totalWidth = Math.round(this.drawer.wrapper.scrollWidth);
    const requiredCanvases = Math.ceil(totalWidth / this.maxCanvasElementWidth);

    while (this.canvases.length < requiredCanvases) {
      this.addCanvas();
    }

    while (this.canvases.length > requiredCanvases) {
      this.removeCanvas();
    }
  }

  updateCanvasesPositioning() {
    // cache length for performance
    const canvasesLength = this.canvases.length;
    this.canvases.forEach((canvas, i) => {
      // canvas width is the max element width, or if it is the last the
      // required width
      const canvasWidth =
        i === canvasesLength - 1
          ? this.drawer.wrapper.scrollWidth -
            this.maxCanvasElementWidth * (canvasesLength - 1)
          : this.maxCanvasElementWidth;
      // set dimensions and style
      canvas.width = canvasWidth * this.pixelRatio;
      // on certain pixel ratios the canvas appears cut off at the bottom,
      // therefore leave 1px extra
      canvas.height = (this.params.height + 1) * this.pixelRatio;

      utils.style(canvas, {
        width: `${canvasWidth}px`,
        height: `${this.params.height}px`,
        left: `${i * this.maxCanvasElementWidth}px`,
      });
    });
  }

  renderCanvases() {
    const duration = this.params.duration || this.wavesurfer.getDuration();

    if (duration <= 0) {
      return;
    }

    const wsParams = this.wavesurfer.params;
    const fontSize = this.params.fontSize * wsParams.pixelRatio;
    const totalSeconds = parseInt(duration.toString(), 10) + 1;
    const width =
      wsParams.fillParent && !wsParams.scrollParent
        ? this.drawer.getWidth()
        : this.drawer.wrapper.scrollWidth * wsParams.pixelRatio;
    const height1 = this.params.height * this.pixelRatio;
    const height2 =
      this.params.height *
      (this.params.notchPercentHeight / 100) *
      this.pixelRatio;
    const pixelsPerSecond = width / duration;

    const formatTime = this.params.formatTimeCallback;
    // if parameter is function, call the function with
    // pixelsPerSecond, otherwise simply take the value as-is
    const intervalFnOrVal = (option: number | Function) =>
      typeof option === "function" ? option(pixelsPerSecond) : option;
    const timeInterval = intervalFnOrVal(this.params.timeInterval);
    const primaryLabelInterval = intervalFnOrVal(
      this.params.primaryLabelInterval
    );
    const secondaryLabelInterval = intervalFnOrVal(
      this.params.secondaryLabelInterval
    );

    let curPixel = pixelsPerSecond * this.params.offset!;
    let curSeconds = 0;
    let i;

    // build an array of position data with index, second and pixel data,
    // this is then used multiple times below
    const positioning: Array<[number, number, number]> = [];

    // render until end in case we have a negative offset
    const renderSeconds =
      this.params.offset! < 0
        ? totalSeconds - this.params.offset!
        : totalSeconds;

    for (i = 0; i < renderSeconds / timeInterval; i++) {
      positioning.push([i, curSeconds, curPixel]);

      curSeconds += timeInterval;
      curPixel += pixelsPerSecond * timeInterval;
    }

    // iterate over each position
    const renderPositions = (cb: (a: number, b: number, c: number) => void) => {
      positioning.forEach((pos) => {
        cb(pos[0], pos[1], pos[2]);
      });
    };

    // render primary labels
    this.setFillStyles(this.params.primaryColor);
    this.setFonts(`${fontSize}px ${this.params.fontFamily}`);
    this.setFillStyles(this.params.primaryFontColor);

    renderPositions((i, curSeconds, curPixel) => {
      if (i % primaryLabelInterval === 0) {
        this.fillRect(curPixel, 0, 1, height1);
        this.fillText(
          formatTime(curSeconds, pixelsPerSecond),
          curPixel + this.params.labelPadding * this.pixelRatio,
          height1
        );
      }
    });

    // render secondary labels
    this.setFillStyles(this.params.secondaryColor);
    this.setFonts(`${fontSize}px ${this.params.fontFamily}`);
    this.setFillStyles(this.params.secondaryFontColor);

    renderPositions((i, curSeconds, curPixel) => {
      if (i % secondaryLabelInterval === 0) {
        this.fillRect(curPixel, 0, 1, height1);
        this.fillText(
          formatTime(curSeconds, pixelsPerSecond),
          curPixel + this.params.labelPadding * this.pixelRatio,
          height1
        );
      }
    });

    // render the actual notches (when no labels are used)
    this.setFillStyles(this.params.unlabeledNotchColor);

    renderPositions((i, curSeconds, curPixel) => {
      if (i % secondaryLabelInterval !== 0 && i % primaryLabelInterval !== 0) {
        this.fillRect(curPixel, 0, 1, height2);
      }
    });
  }

  setFillStyles(fillStyle: string | CanvasGradient | CanvasPattern) {
    this.canvases.forEach((canvas) => {
      const context = canvas.getContext("2d");

      if (context) {
        context.fillStyle = fillStyle;
      }
    });
  }

  setFonts(font: string) {
    this.canvases.forEach((canvas) => {
      const context = canvas.getContext("2d");

      if (context) {
        context.font = font;
      }
    });
  }

  fillRect(x: number, y: number, width: number, height: number) {
    this.canvases.forEach((canvas, i) => {
      const leftOffset = i * this.maxCanvasWidth;

      const intersection = {
        x1: Math.max(x, i * this.maxCanvasWidth),
        y1: y,
        x2: Math.min(x + width, i * this.maxCanvasWidth + canvas.width),
        y2: y + height,
      };

      if (intersection.x1 < intersection.x2) {
        const context = canvas.getContext("2d");
        if (context) {
          context.fillRect(
            intersection.x1 - leftOffset,
            intersection.y1,
            intersection.x2 - intersection.x1,
            intersection.y2 - intersection.y1
          );
        }
      }
    });
  }

  fillText(text: string, x: number, y: number) {
    let textWidth = 0;
    let xOffset = 0;

    this.canvases.forEach((canvas) => {
      const context = canvas.getContext("2d");

      if (context) {
        const canvasWidth = context.canvas.width;

        if (xOffset > x + textWidth) {
          return;
        }

        if (xOffset + canvasWidth > x && context) {
          textWidth = context.measureText(text).width;
          context.fillText(text, x - xOffset, y);
        }

        xOffset += canvasWidth;
      }
    });
  }

  defaultFormatTimeCallback(seconds: any, pxPerSec: number) {
    if (seconds / 60 > 1) {
      // calculate minutes and seconds from seconds count
      const minutes = parseInt((seconds / 60).toString(), 10);

      seconds = parseInt((seconds % 60).toString(), 10);
      // fill up seconds with zeroes
      seconds = seconds < 10 ? "0" + seconds : seconds;

      return `${minutes}:${seconds}`;
    }

    return Math.round(seconds * 1000) / 1000;
  }

  defaultTimeInterval(pxPerSec: number) {
    if (pxPerSec >= 25) {
      return 1;
    } else if (pxPerSec * 5 >= 25) {
      return 5;
    } else if (pxPerSec * 15 >= 25) {
      return 15;
    }
    return Math.ceil(0.5 / pxPerSec) * 60;
  }

  defaultPrimaryLabelInterval(pxPerSec: number) {
    if (pxPerSec >= 25) {
      return 10;
    } else if (pxPerSec * 5 >= 25) {
      return 6;
    } else if (pxPerSec * 15 >= 25) {
      return 4;
    }
    return 4;
  }

  defaultSecondaryLabelInterval(pxPerSec: number) {
    if (pxPerSec >= 25) {
      return 5;
    } else if (pxPerSec * 5 >= 25) {
      return 2;
    } else if (pxPerSec * 15 >= 25) {
      return 2;
    }
    return 2;
  }
}
