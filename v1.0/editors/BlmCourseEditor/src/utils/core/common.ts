import { MapType } from "types";

export function createUUID() {
  let dt = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}

export function createShortUUID() {
  let dt = new Date().getTime();
  const uuid = "xxxy4xxxx".replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}

export function toNumber(str: string) {
  return parseFloat(str);
}

export function toBoolean(value?: string | boolean | null) {
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  } else if (typeof value === "boolean") {
    return value;
  }

  return value ? true : false;
}

export function toJSONString<T extends object>(obj?: T | null) {
  if (obj) {
    return JSON.stringify(obj);
  }

  return null;
}

export function toDeepJSONString<T extends object>(obj: T) {
  type MappedType = MapType<T, object, string>;
  const result = { ...obj } as MappedType;

  for (const key in result) {
    const value = result[key];

    if (typeof value === "object") {
      //https://stackoverflow.com/questions/56925857/type-1-is-not-assignable-to-type-textractkeyof-t-string
      result[key] = JSON.stringify(value) as MappedType[typeof key];
    }
  }

  return JSON.stringify(result);
}

export function toJSONObject<T = object>(str?: string | null): T | null {
  let result = null;

  if (str && str !== "null") {
    try {
      result = JSON.parse(str);
    } catch {
      result = null;
    }
  }

  return result;
}

//https://gist.github.com/nblackburn/875e6ff75bc8ce171c758bf75f304707
export function camelToKebab(str: string) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

//https://gist.github.com/timhobbs/23c891bfea312cf43f31395d2d6660b1
export function toCamelCase(str: string) {
  str = str.toLowerCase().replace(/(?:(^.)|([-_\s]+.))/g, function (match) {
    return match.charAt(match.length - 1).toUpperCase();
  });
  return str.charAt(0).toLowerCase() + str.substring(1);
}

export function compareVersion(version1: string, version2: string) {
  const arr1 = version1.split(".");
  const arr2 = version2.split(".");
  const len = Math.max(arr1.length, arr2.length);

  for (let i = 0; i < len; i++) {
    const revision1 = arr1[i] ?? 0;
    const revision2 = arr2[i] ?? 0;
    const diff = parseInt(revision2) - parseInt(revision1);

    if (diff >= 1) {
      return 1;
    } else if (diff <= -1) {
      return -1;
    }
  }

  return 0;
}

export function toBRs(str: string) {
  return str.replace(/(?:\r\n|\r|\n)/g, "<br>");
}

export function toNewLines(str: string) {
  return str.replace(/<br\s*[/]?>/gi, "\n");
}
