import i18next from "i18next";

import { MIMEType } from "editor-constants";
import { MediaTrackCue } from "types";
import { formatFullTime, parseWebVTT } from "utils";

const Image = [MIMEType.JPG, MIMEType.JPEG, MIMEType.PNG, MIMEType.GIF, MIMEType.SVG];
const Video = [MIMEType.MP4, MIMEType.WEBM];
const Zip = [MIMEType.ZIP, MIMEType.ZIP_COMPRESSED];
const JSON = [MIMEType.JSON];

export const isImage = (type: MIMEType) => {
  return Image.indexOf(type) !== -1;
};

export const isVideo = (type: MIMEType) => {
  return Video.indexOf(type) !== -1;
};

export const isAudio = (type: MIMEType) => {
  return MIMEType.MPEG === type;
};

export const isZip = (type: MIMEType) => {
  return Zip.indexOf(type) !== -1;
};

export const isJSON = (type: MIMEType) => {
  return JSON.indexOf(type) !== -1;
};

export const getFileName = (name: string) => {
  return name.replace(/\.[^/.]+$/, "");
};

export const getFileExtension = (name: string) => {
  const arr = name.split(".");
  return arr.length > 1 ? arr.pop()!.toLowerCase() : "";
};

export const getFileSize = (bytes: number) => {
  return bytes / (1024 * 1024);
};

export function createVTTFile(tracks: MediaTrackCue[]) {
  return tracks.reduce((str, track, index) => {
    const { startTime, endTime, text } = track;

    return (
      str +
      `\n\n${formatFullTime(startTime)} --> ${formatFullTime(endTime)}\n${text.replace(
        /(^[ \t]*\n)/gm,
        ""
      )}`
    );
  }, `WEBVTT`);
}

export function createMediaCues(file: string) {
  const result = parseWebVTT(file);

  if (result.valid) {
    return result.cues.map((item) => {
      const { start, end, text } = item;

      return new MediaTrackCue(start, end, text);
    });
  } else {
    console.error(result.errors);
  }

  return [];
}

export function validateFile(file: File, extension?: string) {
  if (getFileSize(file.size) > 100) {
    throw new Error(i18next.t("utils:alert.file_size"));
  } else if (extension) {
    const newExtenstion = getFileExtension(file.name);

    if (extension !== newExtenstion) {
      throw new Error(i18next.t("utils:alert.file_type"));
    }
  }
}
