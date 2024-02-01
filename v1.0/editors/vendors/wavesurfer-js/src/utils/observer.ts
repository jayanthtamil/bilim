export class Observer {
  handlers: { [key: string]: Function[] } | null;
  _disabledEventEmissions: string[];

  constructor() {
    this.handlers = null;
    this._disabledEventEmissions = [];
  }

  on(event: string, fn: Function) {
    if (!this.handlers) {
      this.handlers = {};
    }

    let handlers = this.handlers[event];

    if (!handlers) {
      handlers = this.handlers[event] = [];
    }

    handlers.push(fn);

    // Return an event descriptor
    return {
      name: event,
      callback: fn,
      un: (e: string, fn: Function) => this.un(e, fn),
    };
  }

  un(event: string, fn: Function) {
    if (!this.handlers) {
      return;
    }

    const handlers = this.handlers[event];
    let i;

    if (handlers) {
      if (fn) {
        for (i = handlers.length - 1; i >= 0; i--) {
          if (handlers[i] === fn) {
            handlers.splice(i, 1);
          }
        }
      } else {
        handlers.length = 0;
      }
    }
  }

  unAll() {
    this.handlers = null;
  }

  once(event: string, handler: Function) {
    const fn = (...args: any[]) => {
      /*  eslint-disable no-invalid-this */
      handler.apply(this, args);
      /*  eslint-enable no-invalid-this */
      setTimeout(() => {
        this.un(event, fn);
      }, 0);
    };

    return this.on(event, fn);
  }

  setDisabledEventEmissions(eventNames: string[]) {
    this._disabledEventEmissions = eventNames;
  }

  _isDisabledEventEmission(event: string) {
    return (
      this._disabledEventEmissions &&
      this._disabledEventEmissions.includes(event)
    );
  }

  fireEvent(event: string, ...args: any[]) {
    if (!this.handlers || this._isDisabledEventEmission(event)) {
      return;
    }

    const handlers = this.handlers[event];

    handlers &&
      handlers.forEach((fn) => {
        fn(...args);
      });
  }
}
