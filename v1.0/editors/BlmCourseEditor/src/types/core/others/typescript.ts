//https:stackoverflow.com/questions/49752151/typescript-keyof-returning-specific-type

export type KeysOfType<T, TProp> = Exclude<
  {
    [P in keyof T]: T[P] extends TProp | undefined | null ? P : never;
  }[keyof T],
  undefined
>;

export type MapType<T, M, N> = {
  [P in keyof T]: T[P] extends M | undefined | null ? N : T[P];
};

export type SimpleObject = { [key: string]: any };
