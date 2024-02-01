import { SimpleObject } from "types";
import { parseTimestamp, validTimestamp } from "utils";

/**
 * See spec: https://www.w3.org/TR/webvtt1/#file-structure
 * https://github.com/osk/node-webvtt/blob/master/lib/parser.js
 */
export function parseWebVTT(input: string, options?: { meta?: boolean; strict?: boolean }) {
  const { meta = false, strict = true } = options || {};

  input = input.trim();
  input = input.replace(/\r\n/g, "\n");
  input = input.replace(/\r/g, "\n");

  const parts = input.split("\n\n");
  const header = parts.shift();

  if (!header?.startsWith("WEBVTT")) {
    throw new Error('Must start with "WEBVTT"');
  }

  const headerParts = header.split("\n");
  const headerComments = headerParts[0].replace("WEBVTT", "");

  if (headerComments.length > 0 && headerComments[0] !== " " && headerComments[0] !== "\t") {
    throw new Error("Header comment must start with space or tab");
  }

  // nothing of interests, return early
  if (parts.length === 0 && headerParts.length === 1) {
    return { valid: true, strict, cues: [], errors: [] };
  }

  if (!meta && headerParts.length > 1 && headerParts[1] !== "") {
    throw new Error("Missing blank line after signature");
  }

  const { cues, errors } = parseCues(parts, strict);

  if (strict && errors.length > 0) {
    throw new Error(errors[0]);
  }

  const headerMeta = meta ? parseMeta(headerParts) : null;
  const result: {
    valid: boolean;
    strict: boolean;
    meta?: typeof headerMeta;
    cues: typeof cues;
    errors: typeof errors;
  } = {
    valid: errors.length === 0,
    strict,
    cues,
    errors,
  };

  if (meta) {
    result.meta = headerMeta;
  }

  return result;
}

function parseMeta(headerParts: string[]) {
  const meta: SimpleObject = {};

  headerParts.slice(1).forEach((header) => {
    const splitIdx = header.indexOf(":");
    const key = header.slice(0, splitIdx).trim();
    const value = header.slice(splitIdx + 1).trim();

    meta[key] = value;
  });

  return Object.keys(meta).length > 0 ? meta : null;
}

function parseCues(cues: string[], strict: boolean) {
  const errors: string[] = [];
  const parsedCues = cues
    .map((cue, i) => {
      try {
        return parseCue(cue, i, strict);
      } catch (e) {
        errors.push(e as string);
        return null;
      }
    })
    .filter(Boolean) as Exclude<ReturnType<typeof parseCue>, null>[];

  return {
    cues: parsedCues,
    errors,
  };
}

/**
 * Parse a single cue block.
 *
 * @param {array} cue Array of content for the cue
 * @param {number} i Index of cue in array
 *
 * @returns {object} cue Cue object with start, end, text and styles.
 *                       Null if it's a note
 */
function parseCue(cue: string, i: number, strict: boolean) {
  let identifier = "";
  let start = 0;
  let end = 0.01;
  let text = "";
  let styles = "";

  // split and remove empty lines
  const lines = cue.split("\n").filter(Boolean);

  if (lines.length > 0 && lines[0].trim().startsWith("NOTE")) {
    return null;
  }

  if (lines.length === 1 && !lines[0].includes("-->")) {
    throw new Error(`Cue identifier cannot be standalone (cue #${i})`);
  }

  if (lines.length > 1 && !(lines[0].includes("-->") || lines[1].includes("-->"))) {
    throw new Error(`Cue identifier needs to be followed by timestamp (cue #${i})`);
  }

  if (lines.length > 1 && lines[1].includes("-->")) {
    identifier = lines.shift() || "";
  }

  const times = typeof lines[0] === "string" ? lines[0].split(" --> ") : [];

  if (times.length !== 2 || !validTimestamp(times[0]) || !validTimestamp(times[1])) {
    throw new Error(`Invalid cue timestamp (cue #${i})`);
  }

  start = parseTimestamp(times[0]);
  end = parseTimestamp(times[1]);

  if (strict) {
    if (start > end) {
      throw new Error(`Start timestamp greater than end (cue #${i})`);
    }

    if (end <= start) {
      throw new Error(`End must be greater than start (cue #${i})`);
    }
  }

  if (!strict && end < start) {
    throw new Error(`End must be greater or equal to start when not strict (cue #${i})`);
  }

  lines.shift();

  text = lines.join("\n") || "";

  return { identifier, start, end, text, styles };
}
