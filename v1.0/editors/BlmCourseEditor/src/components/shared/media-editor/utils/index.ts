import { MediaTrackCue } from "types";
import { MediaCueActions, MediaTrackTypes } from "editor-constants";
import { Player, PlayerState } from "@lottiefiles/react-lottie-player";

export function isMediaElement<T>(
  media: HTMLMediaElement | T
): media is HTMLVideoElement | HTMLAudioElement {
  return media instanceof HTMLMediaElement;
}

export function isMediaPlaying(media: HTMLMediaElement | Player) {
  if (isMediaElement(media)) {
    return !!(media.currentTime > 0 && !media.paused && !media.ended && media.readyState > 2);
  } else {
    return media.state.playerState === PlayerState.Playing;
  }
}

export function cloneCue(target: MediaTrackCue, source: Partial<MediaTrackCue>) {
  return { ...target, ...source };
}

export function cloneCues(
  cues: MediaTrackCue[],
  target: MediaTrackCue,
  source: Partial<MediaTrackCue>
) {
  return cues.map((item) => (item === target ? cloneCue(target, source) : item));
}

export function getCurrentVideoCues(cues: MediaTrackCue[], duration: number) {
  return cues.filter((item) => {
    const { startTime, endTime } = item;

    if (isNaN(endTime)) {
      return startTime >= 0 && startTime <= duration;
    } else {
      return startTime >= 0 && startTime <= duration && endTime >= 0 && endTime <= duration;
    }
  });
}

export function getSubtitleMarkerCues(cues: MediaTrackCue[], duration: number) {
  return cues.filter((item) => {
    const { startTime, endTime } = item;

    if (isNaN(endTime)) {
      return startTime >= 0 && startTime <= duration;
    } else {
      return startTime >= 0 && startTime <= duration && endTime >= 0;
    }
  });
}

export function getCurrentCues(
  type: MediaTrackTypes,
  cues: MediaTrackCue[],
  currentTime: number,
  duration: number
) {
  const totalTime = currentTime + duration;

  return cues.filter((item) => {
    const { startTime, endTime } = item;

    if (type === MediaTrackTypes.Subtitles || type === MediaTrackTypes.Labels) {
      return (
        (startTime >= currentTime && startTime <= totalTime) ||
        (endTime >= currentTime && endTime <= totalTime) ||
        (startTime < currentTime && endTime > totalTime)
      );
    } else {
      return startTime >= currentTime && startTime < totalTime;
    }
  });
}

export function getCurrentCue(cues: MediaTrackCue[], currentTime: number) {
  return cues.find((item, ind) => {
    if (!item.action || item.action === MediaCueActions.ScrollVPauseC) {
      return item.startTime <= currentTime && item.endTime > currentTime;
    } else {
      const next = cues[ind + 1];

      return item.startTime <= currentTime && (!next || next.startTime > currentTime);
    }
  });
}

export function validateCue(type: MediaTrackTypes, cues: MediaTrackCue[], cue: MediaTrackCue) {
  const { startTime, endTime } = cue;
  const index = cues.indexOf(cue);
  const previous = cues[index - 1];

  if (type === MediaTrackTypes.Subtitles || type === MediaTrackTypes.Labels) {
    return (
      startTime >= 0 &&
      endTime >= 0 &&
      startTime < endTime &&
      endTime - startTime > 0.2 &&
      (!previous || previous.endTime < startTime)
    );
  } else {
    return startTime >= 0 && (!previous || previous.startTime < startTime);
  }
}

export function findCueIndex(type: MediaTrackTypes, cues: MediaTrackCue[], currentTime: number) {
  return cues.findIndex((cue, index) => {
    const { startTime, endTime } = cue;
    const next = cues[index + 1];

    if (type === MediaTrackTypes.Subtitles || type === MediaTrackTypes.Labels) {
      return (
        (startTime <= currentTime && endTime > currentTime) ||
        (currentTime >= endTime && (!next || currentTime < next.startTime))
      );
    } else {
      return startTime <= currentTime && (!next || currentTime < next.startTime);
    }
  });
}

export function validateCues(type: MediaTrackTypes, cues: MediaTrackCue[]) {
  if (type === MediaTrackTypes.Contents) {
    cues.forEach((cue) => {
      if (!cue.content) {
        throw new Error("Please select simple content");
      }
    });
  }
}

export function normalizeMarkers(markers: MediaTrackCue[], duration: number) {
  return markers.map((marker, ind) => {
    const next = markers[ind + 1];

    return { ...marker, endTime: next?.startTime ?? duration };
  });
}

export function convertTimeToXPos(time: number, pxPerSec: number, scrollTime = 0) {
  return (time - scrollTime) * pxPerSec;
}

export function convertXPosToTime(xPos: number, pxPerSec: number, scrollTime = 0) {
  return xPos / pxPerSec + scrollTime;
}
