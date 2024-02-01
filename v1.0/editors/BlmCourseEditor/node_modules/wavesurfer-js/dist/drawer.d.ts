import { WaveSurferOptions } from "./types";
import * as util from "./utils";
export default class Drawer extends util.Observer {
    container: HTMLElement;
    params: WaveSurferOptions;
    width: number;
    height: number;
    lastPos: number;
    wrapper: HTMLElement;
    constructor(container: HTMLElement, params: WaveSurferOptions);
    style(el: HTMLElement, styles: {
        [key: string]: any;
    }): HTMLElement;
    createWrapper(): void;
    drawPeaks(peaks: number[] | Array<number[]>, length: number, start: number, end: number): void;
    resetScroll(): void;
    recenter(percent: number): void;
    recenterOnPosition(position: number, immediate: boolean): void;
    getScrollX(): number;
    getWidth(): number;
    setWidth(width: number): boolean;
    setHeight(height: number): boolean;
    progress(progress: number): void;
    destroy(): void;
    updateCursor(): void;
    updateSize(): void;
    drawBars(peaks: number[] | number[][], channelIndex: number, start: number, end: number): void;
    drawWave(peaks: number[] | number[][], channelIndex: number, start: number, end: number): void;
    clearWave(): void;
    updateProgress(position: number): void;
}
