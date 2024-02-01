import padStart from "lodash/padStart";

const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
};
const TIMESTAMP_REGEXP = /([0-9]{1,2})?:?([0-9]{2}):([0-9]{2}\.[0-9]{2,3})/;

export function formatDate(str: string) {
  return new Date(str).toLocaleDateString([], options) + " GMT";
}

function createTime(time: number) {
  const hr = Math.floor(time / 3600);
  const min = Math.floor((time / 60) % 60);
  const sec = Math.floor(time % 60);
  const ms = Math.floor((time * 1000) % 1000);
  const pad = (i: number, len = 2) => padStart(i.toString(), len, "0");

  return { hr: pad(hr), min: pad(min), sec: pad(sec), ms: pad(ms, 3) };
}

export function formatTime(time: number) {
  const { hr, min, sec } = createTime(time);

  return `${hr}:${min}:${sec}`;
}

export function formatFullTime(time: number) {
  const { hr, min, sec, ms } = createTime(time);

  return `${hr}:${min}:${sec}.${ms}`;
}

export function formatShortTime(time: number) {
  const { min, sec, ms } = createTime(time);

  return `${min}:${sec}.${ms}`;
}

export function validTimestamp(timestamp: string) {
  return TIMESTAMP_REGEXP.test(timestamp);
}

export function parseTimestamp(timestamp: string) {
  const matches = timestamp.match(TIMESTAMP_REGEXP);
  let secs = parseFloat(matches![1] || "0") * 60 * 60; // hours
  secs += parseFloat(matches![2] || "0") * 60; // mins
  secs += parseFloat(matches![3] || "0");

  return secs;
}
