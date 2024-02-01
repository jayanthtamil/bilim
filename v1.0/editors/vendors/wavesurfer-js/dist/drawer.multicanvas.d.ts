import { WaveSurferOptions } from "./types";
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
    constructor(container: HTMLElement, params: WaveSurferOptions);
    init(): void;
    createElements(): void;
    updateCursor(): void;
    updateSize(): void;
    addCanvas(): void;
    removeCanvas(): void;
    updateDimensions(entry: CanvasEntry, width: number, height: number): void;
    clearWave(): void;
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
    drawBars(peaks: number[] | number[][], channelIndex: number, start: number, end: number): number;
    drawWave(peaks: number[] | number[][], channelIndex: number, start: number, end: number): number;
    drawLine(peaks: number[], absmax: number, halfH: number, offsetY: number, start: number, end: number, channelIndex: number): void;
    fillRect(x: number, y: number, width: number, height: number, radius: number, channelIndex: number): void;
    hideChannel(channelIndex: number): boolean;
    prepareDraw(peaks: number[] | number[][], channelIndex: number, start: number, end: number, fn: (obj: {
        absmax: number;
        hasMinVals: boolean;
        height: number;
        offsetY: number;
        halfH: number;
        peaks: number[];
        channelIndex: number;
    }) => void, drawIndex?: number, normalizedMax?: number): number;
    setFillStyles(entry: CanvasEntry, waveColor?: string, progressColor?: string): void;
    updateProgress(position: number): void;
}
