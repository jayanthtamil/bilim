import { useState, useRef, useEffect, useLayoutEffect } from "react";

export function useLatest<T>(value: T) {
  const ref = useRef(value);

  ref.current = value;

  return ref;
}

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

//https://stackoverflow.com/questions/19014250/rerender-view-on-browser-resize-with-react
export function useWindowSize() {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

export function useForceUpdate() {
  const [, setValue] = useState(0);

  return () => setValue((value) => value + 1);
}
