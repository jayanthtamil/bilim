/// <reference types="lodash" />
import debounce from "lodash/debounce";
import { PluginDefinition, WaveSurferOptions } from "./types";
import * as utils from "./utils";
import MultiCanvas from "./drawer.multicanvas";
export default class WaveSurfer extends utils.Observer {
    params: WaveSurferOptions;
    container: HTMLElement;
    drawer: MultiCanvas;
    currentTime: number;
    duration: number;
    peaks: number[] | number[][];
    initialisedPluginList: {
        [key: string]: any;
    };
    isReady: boolean;
    isDestroyed: boolean;
    _onResize: ReturnType<typeof debounce>;
    static create(params: Partial<WaveSurferOptions>): WaveSurfer;
    constructor(params: Partial<WaveSurferOptions>);
    init(): this;
    registerPlugins(plugins: PluginDefinition[]): this;
    getActivePlugins(): {
        [key: string]: any;
    };
    addPlugin(plugin: PluginDefinition): this;
    initPlugin(name: string): this;
    destroyPlugin(name: string): this;
    destroyAllPlugins(): void;
    createDrawer(): void;
    getPlayedPercents(): number;
    getDuration(): number;
    getCurrentTime(): number;
    setCurrentTime(seconds: number): void;
    toggleScroll(): void;
    getWaveColor(channelIdx?: number): string;
    setWaveColor(color: string, channelIdx?: number): void;
    getProgressColor(channelIdx: number): string;
    setProgressColor(color: string, channelIdx?: number): void;
    getBackgroundColor(): string | null;
    setBackgroundColor(color: string): void;
    getCursorColor(): string;
    setCursorColor(color: string): void;
    getHeight(): number;
    setHeight(height: number): void;
    setFilteredChannels(channelIndices: number[]): void;
    drawBuffer(): void;
    zoom(pxPerSec: number): void;
    load(peaks: number[] | Array<number[]>, duration: number): void;
    loadBuffer(peaks: number[] | Array<number[]>, duration: number): void;
    empty(): void;
    destroy(): void;
}
