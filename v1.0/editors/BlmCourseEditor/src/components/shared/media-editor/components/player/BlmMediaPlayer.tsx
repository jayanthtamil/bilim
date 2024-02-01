import React, {
  useRef,
  forwardRef,
  memo,
  useImperativeHandle,
  ForwardRefRenderFunction,
  RefObject,
  useState,
} from "react";
import clsx from "clsx";
import { AnimationItem } from "lottie-web";
import { Player, PlayerEvent } from "@lottiefiles/react-lottie-player";

import { MediaPlayerTypes } from "editor-constants";
import { isMediaElement, isMediaPlaying } from "../../utils";
import { useMediaEditorContext } from "../context";
import "./styles.scss";

export interface CompProps {
  src: string;
  onTimeChange?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
}

export interface MediaPlayerRef {
  element: HTMLMediaElement | Player | null;
  lottie?: AnimationItem;
  isPlaying: () => boolean;
  pause: () => void;
  seek: (time: number) => void;
}

const BlmMediaPlayer: ForwardRefRenderFunction<MediaPlayerRef, CompProps> = (props, ref) => {
  const { src, onTimeChange, onDurationChange } = props;
  const [lottie, setLottie] = useState<AnimationItem>();
  const mediaRef = useRef<HTMLMediaElement | Player>(null);
  const { playerType } = useMediaEditorContext();

  useImperativeHandle(
    ref,
    () => ({
      element: mediaRef.current,
      lottie,
      isPlaying,
      pause,
      seek,
    }),
    [lottie]
  );

  const isPlaying = () => {
    const media = mediaRef.current;

    return media ? isMediaPlaying(media) : false;
  };

  const play = () => {
    mediaRef.current?.play();
  };

  const pause = () => {
    mediaRef.current?.pause();
  };

  const seek = (time: number) => {
    const media = mediaRef.current;

    if (!media) {
      return;
    }

    if (isMediaElement(media)) {
      media.currentTime = time;
    } else {
      media?.setSeeker(time);
    }
  };

  const togglePlay = () => {
    if (isPlaying()) {
      pause();
    } else {
      play();
    }
  };

  const handleTimeUpdate = () => {
    const media = mediaRef.current as HTMLMediaElement;

    if (media && onTimeChange) {
      onTimeChange(media.currentTime);
    }
  };

  const handleDurationChange = () => {
    const media = mediaRef.current as HTMLMediaElement;

    if (media && onDurationChange) {
      onDurationChange(media.duration);
    }
  };

  const handleLottieEvent = (event: PlayerEvent) => {
    if (!lottie) {
      return;
    }

    if (event === "load" && onDurationChange) {
      onDurationChange(lottie.totalFrames);
    } else if (event === "frame" && onTimeChange) {
      onTimeChange(lottie.currentFrame);
    }
  };

  const handleClick = () => {
    togglePlay();
  };

  const renderChildren = () => {
    if (playerType === MediaPlayerTypes.Audio) {
      return (
        <audio
          ref={mediaRef as RefObject<HTMLAudioElement>}
          src={src}
          onClick={handleClick}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          controls
        />
      );
    } else if (playerType === MediaPlayerTypes.Video) {
      return (
        <video
          ref={mediaRef as RefObject<HTMLVideoElement>}
          src={src}
          onClick={handleClick}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
        />
      );
    } else if (playerType === MediaPlayerTypes.Lottie) {
      return (
        <div className="lottie-player-wrapper" onClick={handleClick}>
          <Player
            ref={mediaRef as RefObject<Player>}
            lottieRef={(instance) => setLottie(instance)}
            src={src}
            autoplay={false}
            loop={false}
            controls={true}
            keepLastFrame={false}
            onEvent={handleLottieEvent}
          />
        </div>
      );
    }
  };

  return <div className={clsx("media-player", playerType)}>{renderChildren()}</div>;
};

export default memo(forwardRef(BlmMediaPlayer));
