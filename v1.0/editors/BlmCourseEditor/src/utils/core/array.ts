import { KeysOfType } from "types";
import { toNumber } from "./common";

export function findIndex<T extends object, K extends keyof T>(arr: T[], obj: T | T[K], key: K) {
  const match = typeof obj === "object" ? (obj as T)[key] : obj;

  if (arr) {
    return arr.findIndex((item) => {
      return item[key] && item[key] === match;
    });
  }

  return -1;
}

export function findObject<T extends object, K extends keyof T>(
  arr: T[],
  obj: T | T[K],
  key: K
): T | undefined {
  const match = typeof obj === "object" ? (obj as T)[key] : obj;

  if (arr) {
    return arr.find((item) => {
      return item[key] && item[key] === match;
    });
  }

  return undefined;
}

export function deepCopy<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return [...obj] as any;
  } else if (typeof obj === "object" && obj !== null) {
    const result = { ...obj };

    for (let prop in result) {
      const value = result[prop];

      result[prop] = deepCopy(value);
    }

    return result;
  }

  return obj;
}

export function addObject<T>(arr: T[], obj: T, index: number) {
  const result = [...arr];

  result.splice(index, 0, obj);

  return result;
}

export function updateIndex<T extends object>(arr: T[], index: number, source: Partial<T>) {
  return arr.map((item, ind) =>
    index === ind
      ? {
          ...item,
          ...source,
        }
      : item
  );
}

export function updateObject<T extends object, K extends keyof T>(
  arr: T[],
  key: K,
  obj: T | T[K],
  newObj: Partial<T>
) {
  const match = typeof obj === "object" ? (obj as T)[key] : obj;

  return arr.map((item) =>
    item[key] === match
      ? {
          ...item,
          ...newObj,
        }
      : item
  );
}

export function updateObjectOf<T extends object>(arr: T[], target: T, source: Partial<T>) {
  return arr.map((item) => (item === target ? { ...target, ...source } : item));
}

export function reorderArray<T>(arr: T[], oldIndex: number, newIndex: number) {
  const result = Array.from(arr);
  const [removed] = result.splice(oldIndex, 1);

  result.splice(newIndex, 0, removed);

  return result;
}

export function removeIndex<T>(arr: T[], index: number) {
  const result = [...arr];

  result.splice(index, 1);

  return result;
}

export function removeObject<T>(arr: T[], target: T) {
  return arr.filter((item) => item !== target);
}

export function differenceOfObjects<T extends object>(source: T[], target: T[], key: keyof T) {
  return source.filter((item1) => !target.some((item2) => item1[key] === item2[key]));
}

//https://stackoverflow.com/questions/32609284/construct-flat-array-from-tree-of-objects
export function flatObject<T>(obj: T, key: KeysOfType<T, Array<any>>): T[] {
  const arr = obj[key];

  if (Array.isArray(arr)) {
    return Array.prototype.concat.apply(
      arr,
      arr.map((item) => flatObject(item, key))
    );
  }

  return [];
}

export function filterFalsy<T>(arr: (T | undefined | null)[]) {
  return arr.filter((val) => (val !== undefined && val !== null ? true : false)) as T[];
}

export function filterDuplicates<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function getMaxValue<T extends Partial<Record<K, string | number>>, K extends keyof T>(
  arr: T[],
  key: K
) {
  return arr.reduce((prev, item) => {
    const value = item[key] || 0;

    return Math.max(prev, typeof value === "number" ? value : toNumber(value as string));
  }, 0);
}

export function getObjectKey<T extends string>(
  obj: { [s: string]: T },
  arr: DOMTokenList,
  def: T
): T;
export function getObjectKey<T extends string>(
  obj: { [s: string]: T },
  arr: DOMTokenList
): T | undefined;
export function getObjectKey<T extends string>(
  obj: { [s: string]: T },
  arr: DOMTokenList,
  def?: T
): T | undefined {
  return Object.values(obj).find((value) => arr.contains(value)) ?? def;
}
