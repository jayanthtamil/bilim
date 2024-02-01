import { BackgroundMedia } from "types";
import { filterFalsy, isImage } from "utils";

export function getBGMediaRemovedFiles(...medias: (BackgroundMedia | undefined)[]) {
  if (medias) {
    return medias
      .map((media) => {
        if (media) {
          const { main, webm, image } = media;

          if (!main || isImage(main.type)) {
            return filterFalsy([webm, image]);
          }
        }
        return [];
      })
      .flat();
  }

  return [];
}
