export default class CanvasEntry {
    wave: HTMLCanvasElement;
    progress: HTMLCanvasElement;
    waveCtx: CanvasRenderingContext2D;
    progressCtx: CanvasRenderingContext2D;
    start: number;
    end: number;
    id: string;
    canvasContextAttributes: object;
    hasProgressCanvas: boolean;
    halfPixel: number;
    constructor();
    initWave(element: HTMLCanvasElement): void;
    initProgress(element: HTMLCanvasElement): void;
    updateDimensions(elementWidth: number, totalWidth: number, width: number, height: number): void;
    clearWave(): void;
    setFillStyles(waveColor: string, progressColor: string): void;
    getFillStyle(ctx: CanvasRenderingContext2D, color: string | string[]): string | CanvasGradient;
    fillRects(x: number, y: number, width: number, height: number, radius: number): void;
    fillRectToContext(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void;
    drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void;
    drawLines(peaks: number[], absmax: number, halfH: number, offsetY: number, start: number, end: number): void;
    drawLineToContext(ctx: CanvasRenderingContext2D, peaks: number[], absmax: number, halfH: number, offsetY: number, start: number, end: number): void;
    destroy(): void;
}
