export declare function absMax(values: number[]): number;
export declare function max(values: number[]): number;
export declare function min(values: number[]): number;
export declare function style(el: HTMLElement, styles: {
    [key: string]: any;
}): HTMLElement;
export declare function getId(prefix?: string): string;
export declare function frame(func: Function): (...args: any[]) => any;
