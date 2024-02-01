import React, { ReactElement, useEffect, useState, useRef, RefObject, useCallback } from "react";
import WaveSurfer, { TimelinePlugin } from "wavesurfer-js";
import clsx from "clsx";

import { MediaWavesurfer } from "types";
import { MediaPlayerTypes } from "editor-constants";
import { formatTime } from "utils";
import { MediaPlayerRef } from "../player";
import "./styles.scss";

export interface CompProps {
  type: MediaPlayerTypes;
  peaks?: Array<number>;
  duration: number;
  playerRef: RefObject<MediaPlayerRef>;
  render: (wavesurfer: MediaWavesurfer) => ReactElement;
}

const initWavesurfer: MediaWavesurfer = {
  currentTime: 0,
  scrollTime: 0,
  currentDuration: 0,
  pxPerSec: 100,
  duration: 0,
  width: 0,
};

function BlmWaveForm(props: CompProps) {
  const { type, peaks, duration, playerRef, render } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [state, setState] = useState<MediaWavesurfer>(initWavesurfer);
  const lottie = playerRef.current?.lottie;

  const updateWavesurfer = useCallback((time: number) => {
    const container = containerRef.current;
    const wavesurfer = wavesurferRef.current;

    if (!wavesurfer || !container) {
      return;
    }

    wavesurfer.setCurrentTime(time);

    const currentTime = wavesurfer.getCurrentTime();
    const duration = wavesurfer.getDuration();
    const wrapperWidth = container.clientWidth;
    const width = wavesurfer.drawer.width;
    const pxPerSec = width / duration;
    const currentDuration = wrapperWidth / pxPerSec;
    const scrollX = wavesurfer.drawer.getScrollX();
    const scrollTime = (duration / width) * scrollX;

    setState((prev) => {
      if (
        prev.currentTime !== currentTime ||
        prev.duration !== duration ||
        prev.scrollTime !== scrollTime
      ) {
        return {
          currentTime,
          scrollTime,
          currentDuration,
          pxPerSec,
          duration,
          width,
        };
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const isLottie = type === MediaPlayerTypes.Lottie;

    if (container) {
      const wavesurfer = WaveSurfer.create({
        container: container,
        waveColor: "#bfd9f8",
        progressColor: "#bfd9f8",
        cursorColor: "red",
        fillParent: true,
        scrollParent: true,
        hideScrollbar: true,
        autoCenter: true,
        normalize: true,
        pixelRatio: 1,
        minPxPerSec: isLottie ? 25 : 100,
        height: container.offsetHeight,
        plugins: [
          TimelinePlugin.create({
            container: "#wavetimeline",
            unlabeledNotchColor: "#98a3b7",
            primaryFontColor: "#98a3b7",
            notchPercentHeight: 50,
            formatTimeCallback: (sec: number) => {
              return isLottie ? sec.toString() : formatTime(sec);
            },
            timeInterval: () => (isLottie ? 1 : 0.5) as any,
            primaryLabelInterval: () => 2,
            secondaryLabelInterval: () => 0,
          }) as any,
        ],
      });

      const handleEvent = () => {
        updateWavesurfer(0);
      };

      wavesurferRef.current = wavesurfer;
      wavesurfer.on("ready", handleEvent);

      return () => {
        wavesurfer.destroy();
      };
    }
  }, [type, updateWavesurfer]);

  useEffect(() => {
    const wavesurfer = wavesurferRef.current;

    if (wavesurfer && peaks) {
      wavesurfer.load(peaks, duration);
    }
  }, [peaks, duration]);

  useEffect(() => {
    const player = playerRef.current?.element;

    if (player && player instanceof HTMLMediaElement) {
      const updateProgress = (useFrame = false) => {
        updateWavesurfer(player.currentTime);

        if (useFrame && !player.paused) {
          requestAnimationFrame(() => updateProgress(true));
        }
      };

      const handleEvent = (event?: Event) => {
        updateProgress(event?.type === "play");
      };

      player.addEventListener("play", handleEvent);
      player.addEventListener("pause", handleEvent);
      player.addEventListener("seeked", handleEvent);
      player.addEventListener("ended", handleEvent);

      return () => {
        player.removeEventListener("play", handleEvent);
        player.removeEventListener("pause", handleEvent);
        player.removeEventListener("seeked", handleEvent);
        player.removeEventListener("ended", handleEvent);
      };
    }
  }, [playerRef, updateWavesurfer]);

  useEffect(() => {
    if (lottie) {
      const updateProgress = (useFrame = false) => {
        updateWavesurfer(lottie.currentFrame);

        if (useFrame && !lottie.isPaused) {
          requestAnimationFrame(() => updateProgress(true));
        }
      };

      const handleEvent = (event: Event) => {
        updateProgress(event.type === "enterFrame");
      };

      lottie.addEventListener("enterFrame", handleEvent);
      lottie.addEventListener("complete", handleEvent);

      return () => {
        try {
          lottie.removeEventListener("enterFrame", handleEvent);
          lottie.removeEventListener("complete", handleEvent);
        } catch (er) {}
      };
    }
  }, [lottie, updateWavesurfer]);

  return (
    <div className={clsx("waveform-wrapper", { loading: !peaks })}>
      <div className="waveform-container">
        <div id="wavetimeline" className="wavetimeline" />
        <div ref={containerRef} className="waveform" />
        {peaks && render(state)}
      </div>
    </div>
  );
}

export default BlmWaveForm;
