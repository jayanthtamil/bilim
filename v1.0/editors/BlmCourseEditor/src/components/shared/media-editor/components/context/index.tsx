import React, { createContext, PropsWithChildren, useContext, useMemo } from "react";

import { MediaPlayerTypes } from "editor-constants";

export interface MediaEditorProviderProps {
  playerType: MediaPlayerTypes;
}

const initValue = {
  playerType: MediaPlayerTypes.Video,
  topOffset: 0.1,
  topMinWidth: 0.1,
  mainOffset: 0.01,
  mainMinWidth: 0.2,
};

const lottieValue = {
  playerType: MediaPlayerTypes.Lottie,
  topOffset: 0.5,
  topMinWidth: 0.5,
  mainOffset: 0.05,
  mainMinWidth: 1,
};

const BlmMediaEditorContext = createContext(initValue);

export function BlmMediaEditorProvider(props: PropsWithChildren<MediaEditorProviderProps>) {
  const { playerType, children } = props;

  const value = useMemo(() => {
    if (playerType === MediaPlayerTypes.Lottie) {
      return lottieValue;
    } else {
      return { ...initValue, playerType };
    }
  }, [playerType]);

  return <BlmMediaEditorContext.Provider value={value}>{children}</BlmMediaEditorContext.Provider>;
}

export function useMediaEditorContext() {
  return useContext(BlmMediaEditorContext);
}

export default BlmMediaEditorContext;
