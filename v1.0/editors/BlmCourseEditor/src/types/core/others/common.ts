export interface CustomChangeEvent<T> {
  target: {
    name: string;
    value: T;
  };
}
