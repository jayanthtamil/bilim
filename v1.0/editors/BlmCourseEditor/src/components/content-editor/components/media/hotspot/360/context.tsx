import React, { createContext, PropsWithChildren, useContext, useMemo } from "react";

export interface Hotspot360ProviderProps {
  selectedId?: string;
}

const BlmHotspot360Context = createContext<Hotspot360ProviderProps>({});

export function BlmHotspot360Provider(props: PropsWithChildren<Hotspot360ProviderProps>) {
  const { selectedId, children } = props;

  const value = useMemo(() => {
    return { selectedId };
  }, [selectedId]);

  return <BlmHotspot360Context.Provider value={value}>{children}</BlmHotspot360Context.Provider>;
}

export function useHotspot360Context() {
  return useContext(BlmHotspot360Context);
}

export default BlmHotspot360Context;
