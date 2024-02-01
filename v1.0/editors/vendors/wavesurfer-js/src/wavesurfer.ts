import debounce from "lodash/debounce";

import { PluginDefinition, WaveSurferOptions } from "./types";
import * as utils from "./utils";
import MultiCanvas from "./drawer.multicanvas";

/** All Files and Code is copied from WaveSurfer.js@6.4.0 */

const defaultParams: WaveSurferOptions = {
  autoCenter: true,
  autoCenterRate: 5,
  autoCenterImmediately: false,
  backgroundColor: null,
  barHeight: 1,
  barRadius: 0,
  barGap: undefined,
  barMinHeight: undefined,
  container: null!,
  cursorColor: "#333",
  cursorWidth: 1,
  drawingContextAttributes: {
    // Boolean that hints the user agent to reduce the latency
    // by desynchronizing the canvas paint cycle from the event
    // loop
    desynchronized: false,
  },
  fillParent: true,
  height: 128,
  hideScrollbar: false,
  hideCursor: false,
  maxCanvasWidth: 4000,
  minPxPerSec: 20,
  normalize: false,
  pixelRatio: window.devicePixelRatio,
  plugins: [],
  progressColor: "#555",
  responsive: false,
  scrollParent: false,
  splitChannels: false,
  splitChannelsOptions: {
    overlay: false,
    channelColors: {},
    filterChannels: [],
    relativeNormalization: false,
    splitDragSelection: false,
  },
  waveColor: "#999",
};

export default class WaveSurfer extends utils.Observer {
  params: WaveSurferOptions;
  container: HTMLElement;
  drawer: MultiCanvas;
  currentTime = 0;
  duration = 0;
  peaks: number[] | number[][] = [];
  initialisedPluginList: { [key: string]: any } = {};
  isReady = false;
  isDestroyed = false;
  _onResize: ReturnType<typeof debounce>;

  static create(params: Partial<WaveSurferOptions>) {
    const wavesurfer = new WaveSurfer(params);

    return wavesurfer.init();
  }

  constructor(params: Partial<WaveSurferOptions>) {
    super();

    this.params = Object.assign({}, defaultParams, params);
    this.params.splitChannelsOptions = Object.assign(
      {},
      defaultParams.splitChannelsOptions,
      params.splitChannelsOptions
    );

    this.container =
      "string" == typeof this.params.container
        ? document.querySelector(this.params.container)!
        : this.params.container;

    if (!this.container) {
      throw new Error("Container element not found");
    }

    if (this.params.maxCanvasWidth <= 1) {
      throw new Error("maxCanvasWidth must be greater than 1");
    } else if (this.params.maxCanvasWidth % 2 === 1) {
      throw new Error("maxCanvasWidth must be an even number");
    }

    if (this.params.backgroundColor) {
      this.setBackgroundColor(this.params.backgroundColor);
    }

    this.drawer = null!;
    this.initialisedPluginList = {};
    this.isReady = false;
    this.isDestroyed = false;

    // responsive debounced event listener. If this.params.responsive is not
    // set, this is never called. Use 100ms or this.params.responsive as
    // timeout for the debounce function.
    let prevWidth = 0;
    this._onResize = debounce(
      () => {
        if (
          this.drawer.wrapper &&
          prevWidth !== this.drawer.wrapper.clientWidth &&
          !this.params.scrollParent
        ) {
          prevWidth = this.drawer.wrapper.clientWidth;
          if (prevWidth) {
            // redraw only if waveform container is rendered and has a width
            this.drawer.fireEvent("redraw");
          }
        }
      },
      typeof this.params.responsive === "number" ? this.params.responsive : 100
    );

    return this;
  }

  init() {
    this.registerPlugins(this.params.plugins);
    this.createDrawer();

    return this;
  }

  registerPlugins(plugins: PluginDefinition[]) {
    // first instantiate all the plugins
    plugins.forEach((plugin) => this.addPlugin(plugin));

    // now run the init functions
    plugins.forEach((plugin) => {
      // call init function of the plugin if deferInit is falsey
      // in that case you would manually use initPlugins()
      if (!plugin.deferInit) {
        this.initPlugin(plugin.name);
      }
    });

    this.fireEvent("plugins-registered", plugins);

    return this;
  }

  getActivePlugins() {
    return this.initialisedPluginList;
  }

  addPlugin(plugin: PluginDefinition) {
    if (!plugin.name) {
      throw new Error("Plugin does not have a name!");
    }

    if (!plugin.instance) {
      throw new Error(
        `Plugin ${plugin.name} does not have an instance property!`
      );
    }

    // staticProps properties are applied to wavesurfer instance
    if (plugin.staticProps) {
      Object.keys(plugin.staticProps).forEach((pluginStaticProp) => {
        /**
         * Properties defined in a plugin definition's `staticProps` property are added as
         * staticProps properties of the WaveSurfer instance
         */
        //@ts-ignore
        this[pluginStaticProp] = plugin.staticProps[pluginStaticProp];
      });
    }

    const Instance = plugin.instance;

    //@ts-ignore
    this[plugin.name] = new Instance(plugin.params || {}, this);
    this.fireEvent("plugin-added", plugin.name);

    return this;
  }

  initPlugin(name: string) {
    //@ts-ignore
    if (!this[name]) {
      throw new Error(`Plugin ${name} has not been added yet!`);
    }

    if (this.initialisedPluginList[name]) {
      // destroy any already initialised plugins
      this.destroyPlugin(name);
    }

    //@ts-ignore
    this[name].init();
    this.initialisedPluginList[name] = true;
    this.fireEvent("plugin-initialised", name);

    return this;
  }

  destroyPlugin(name: string) {
    //@ts-ignore
    if (!this[name]) {
      throw new Error(
        `Plugin ${name} has not been added yet and cannot be destroyed!`
      );
    }

    if (!this.initialisedPluginList[name]) {
      throw new Error(`Plugin ${name} is not active and cannot be destroyed!`);
    }

    //@ts-ignore
    if (typeof this[name].destroy !== "function") {
      throw new Error(`Plugin ${name} does not have a destroy function!`);
    }

    //@ts-ignore
    this[name].destroy();
    delete this.initialisedPluginList[name];
    this.fireEvent("plugin-destroyed", name);

    return this;
  }

  destroyAllPlugins() {
    Object.keys(this.initialisedPluginList).forEach((name) =>
      this.destroyPlugin(name)
    );
  }

  createDrawer() {
    this.drawer = new MultiCanvas(this.container, this.params);
    this.drawer.init();
    this.fireEvent("drawer-created", this.drawer);

    if (this.params.responsive !== false) {
      window.addEventListener("resize", this._onResize, true);
      window.addEventListener("orientationchange", this._onResize, true);
    }

    this.drawer.on("redraw", () => {
      this.drawBuffer();
      this.drawer.progress(this.getPlayedPercents());
    });
  }

  getPlayedPercents() {
    return this.currentTime / this.duration;
  }

  getDuration() {
    return this.duration;
  }

  getCurrentTime() {
    return this.currentTime;
  }

  setCurrentTime(seconds: number) {
    this.currentTime = seconds;
    this.drawer.progress(this.currentTime / this.duration);
  }

  toggleScroll() {
    this.params.scrollParent = !this.params.scrollParent;
    this.drawBuffer();
  }

  getWaveColor(channelIdx?: number) {
    if (
      channelIdx &&
      this.params.splitChannelsOptions.channelColors[channelIdx]
    ) {
      return this.params.splitChannelsOptions.channelColors[channelIdx]
        .waveColor;
    }

    return this.params.waveColor;
  }

  setWaveColor(color: string, channelIdx?: number) {
    if (
      channelIdx &&
      this.params.splitChannelsOptions.channelColors[channelIdx]
    ) {
      this.params.splitChannelsOptions.channelColors[channelIdx].waveColor =
        color;
    } else {
      this.params.waveColor = color;
    }

    this.drawBuffer();
  }

  getProgressColor(channelIdx: number) {
    if (
      channelIdx &&
      this.params.splitChannelsOptions.channelColors[channelIdx!]
    ) {
      return this.params.splitChannelsOptions.channelColors[channelIdx!]
        .progressColor;
    }

    return this.params.progressColor;
  }

  setProgressColor(color: string, channelIdx?: number) {
    if (
      channelIdx &&
      this.params.splitChannelsOptions.channelColors[channelIdx]
    ) {
      this.params.splitChannelsOptions.channelColors[channelIdx].progressColor =
        color;
    } else {
      this.params.progressColor = color;
    }

    this.drawBuffer();
  }

  getBackgroundColor() {
    return this.params.backgroundColor;
  }

  setBackgroundColor(color: string) {
    this.params.backgroundColor = color;
    utils.style(this.container, { background: this.params.backgroundColor });
  }

  getCursorColor() {
    return this.params.cursorColor;
  }

  setCursorColor(color: string) {
    this.params.cursorColor = color;
    this.drawer.updateCursor();
  }

  getHeight() {
    return this.params.height;
  }

  setHeight(height: number) {
    this.params.height = height;
    this.drawer.setHeight(height * this.params.pixelRatio);
    this.drawBuffer();
  }

  setFilteredChannels(channelIndices: number[]) {
    this.params.splitChannelsOptions.filterChannels = channelIndices;
    this.drawBuffer();
  }

  drawBuffer() {
    const nominalWidth = Math.round(
      this.getDuration() * this.params.minPxPerSec * this.params.pixelRatio
    );
    const parentWidth = this.drawer.getWidth();
    let width = nominalWidth;
    // always start at 0 after zooming for scrolling : issue redraw left part
    let start = 0;
    let end = Math.max(start + parentWidth, width);

    // Fill container
    if (
      this.params.fillParent &&
      (!this.params.scrollParent || nominalWidth < parentWidth)
    ) {
      width = parentWidth;
      start = 0;
      end = width;
    }

    this.drawer.drawPeaks(this.peaks, width, start, end);
    this.fireEvent("redraw", this.peaks, width);
  }

  zoom(pxPerSec: number) {
    if (!pxPerSec) {
      this.params.minPxPerSec = defaultParams.minPxPerSec;
      this.params.scrollParent = false;
    } else {
      this.params.minPxPerSec = pxPerSec;
      this.params.scrollParent = true;
    }

    this.drawBuffer();
    this.drawer.progress(this.getPlayedPercents());
    this.drawer.recenter(this.getCurrentTime() / this.getDuration());
    this.fireEvent("zoom", pxPerSec);
  }

  load(peaks: number[] | Array<number[]>, duration: number) {
    this.empty();
    this.loadBuffer(peaks, duration);
  }

  loadBuffer(peaks: number[] | Array<number[]>, duration: number) {
    if (peaks) {
      this.peaks = peaks;
      this.duration = duration;
      this.isReady = true;
      this.drawBuffer();
      this.fireEvent("waveform-ready");
      this.fireEvent("ready");
    }
  }

  empty() {
    // empty drawer
    this.drawer.progress(0);
    this.drawer.setWidth(0);
    this.drawer.drawPeaks([], 0, 0, NaN);
  }

  destroy() {
    // this.destroyAllPlugins();
    this.fireEvent("destroy");
    this.unAll();

    if (this.params.responsive !== false) {
      window.removeEventListener("resize", this._onResize, true);
      window.removeEventListener("orientationchange", this._onResize, true);
    }

    if (this.drawer) {
      this.drawer.destroy();
    }

    this.isReady = false;
    this.isDestroyed = true;
  }
}
