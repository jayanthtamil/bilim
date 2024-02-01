/// <reference types="lodash" />
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
    static create(params: Partial<TimelinePluginParams>): {
        name: string;
        deferInit: boolean;
        params: Partial<TimelinePluginParams>;
        instance: typeof TimelinePlugin;
    };
    constructor(params: TimelinePluginParams, ws: WaveSurfer);
    _onScroll: () => void;
    _onRedraw: () => void;
    _onReady: () => void;
    _onWrapperClick: (e: MouseEvent) => void;
    init(): void;
    destroy(): void;
    createWrapper(): void;
    render(): void;
    addCanvas(): void;
    removeCanvas(): void;
    updateCanvases(): void;
    updateCanvasesPositioning(): void;
    renderCanvases(): void;
    setFillStyles(fillStyle: string | CanvasGradient | CanvasPattern): void;
    setFonts(font: string): void;
    fillRect(x: number, y: number, width: number, height: number): void;
    fillText(text: string, x: number, y: number): void;
    defaultFormatTimeCallback(seconds: any, pxPerSec: number): string | number;
    defaultTimeInterval(pxPerSec: number): number;
    defaultPrimaryLabelInterval(pxPerSec: number): 10 | 4 | 6;
    defaultSecondaryLabelInterval(pxPerSec: number): 5 | 2;
}
