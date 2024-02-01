export declare class Observer {
    handlers: {
        [key: string]: Function[];
    } | null;
    _disabledEventEmissions: string[];
    constructor();
    on(event: string, fn: Function): {
        name: string;
        callback: Function;
        un: (e: string, fn: Function) => void;
    };
    un(event: string, fn: Function): void;
    unAll(): void;
    once(event: string, handler: Function): {
        name: string;
        callback: Function;
        un: (e: string, fn: Function) => void;
    };
    setDisabledEventEmissions(eventNames: string[]): void;
    _isDisabledEventEmission(event: string): boolean;
    fireEvent(event: string, ...args: any[]): void;
}
