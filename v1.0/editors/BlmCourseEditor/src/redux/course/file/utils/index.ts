import { AnimationAttachment, AnimationMedia, MediaFile } from "types";
import { MIMEType } from "editor-constants";
import { createUUID, getFileExtension, getFileName, isAudio, isVideo, toNewLines } from "utils";
import { AnimationResponse, FileResponse, FilesResponse } from "../types";

export const createMediaFiles = (response: FilesResponse) => {
  if (response.file && response.file.length) {
    return response.file.map((file) => {
      return createMediaFile(file);
    });
  }

  return [];
};

export const createMediaFile = (response: FileResponse) => {
  const { id, fileName, path, mimeType, rootFile } = response;
  const file = new MediaFile(id, fileName, mimeType as MIMEType, path, rootFile);

  return file;
};

export const createAnimationMedia = (response: AnimationResponse) => {
  const animation = new AnimationMedia();
  const { translations, options, attachments } = response;

  if (translations) {
    animation.translations = translations.map((item) => ({ ...item, text: toNewLines(item.text) }));
  }

  if (options && options.length) {
    animation.options = options[0];
  }

  if (attachments) {
    const files = [];

    for (const item of attachments) {
      const obj = new AnimationAttachment();
      obj.id = createUUID();
      obj.name = item.name;
      obj.url = item.path;
      obj.type = item.mimeType as MIMEType;

      files.push(obj);
    }

    for (const file of files) {
      const { name, type } = file;
      const ext1 = getFileExtension(name);

      if (type && (isVideo(type) || isAudio(type))) {
        const title1 = getFileName(name);

        for (const subtitle of files) {
          const title2 = getFileName(subtitle.name);
          const ext2 = getFileExtension(subtitle.name);

          if (title1 === title2 && ext2 === "vtt") {
            file.subtitle = subtitle;
          }
        }
      }

      if (ext1 !== "vtt") {
        animation.attachments.push(file);
      }
    }
  }

  return animation;
};

export const updateAnimationMedia = (
  animation: AnimationMedia,
  response: Pick<AnimationMedia, "translations" | "options">
) => {
  if (animation) {
    const { translations, options } = response;

    if (translations) {
      animation.translations = translations;
    }

    if (options) {
      animation.options = options;
    }
  }

  return animation;
};

export const updateAnimationAttchement = (
  animation: AnimationMedia,
  attachment: AnimationAttachment
) => {
  if (animation && attachment) {
    const { attachments } = animation;

    animation.attachments = attachments.map((item) =>
      item.id === attachment.id ? { ...attachment, id: createUUID() } : item
    );
  }

  return animation;
};
