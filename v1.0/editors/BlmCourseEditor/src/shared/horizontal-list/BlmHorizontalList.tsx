import React, {
  ForwardRefRenderFunction,
  MouseEvent,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  HTMLAttributes,
} from "react";
import clsx from "clsx";
import clamp from "lodash/clamp";

import "./styles.scss";

export interface CompProps extends HTMLAttributes<HTMLDivElement> {}

const BlmHorizontalList: ForwardRefRenderFunction<HTMLDivElement, CompProps> = (props, ref) => {
  const { children, className, ...others } = props;
  const listRef = useRef<HTMLDivElement>(null);
  const [isPrevEnabled, setIsPrevEnabled] = useState(false);
  const [isNxtEnabled, setIsNxtEnabled] = useState(false);
  const stateRef = useRef({
    timeoutId: undefined as undefined | number,
  });

  const validateBtns = useCallback(() => {
    const list = listRef.current;

    if (list) {
      const { scrollLeft, scrollWidth, clientWidth } = list;
      const scrollLeftMax = scrollWidth - clientWidth;

      setIsPrevEnabled(scrollLeft > 0);
      setIsNxtEnabled(scrollLeft < scrollLeftMax);
    }
  }, [listRef, setIsPrevEnabled, setIsNxtEnabled]);

  useLayoutEffect(() => {
    validateBtns();
  }, [listRef, children, validateBtns]);

  const scrollList = (direction: number) => {
    const list = listRef.current;

    if (list) {
      const { scrollLeft, scrollWidth, clientWidth, firstElementChild } = list;
      const maxScrollLeft = scrollWidth - clientWidth;
      const childWidth = (firstElementChild as HTMLElement)?.offsetWidth || 0;
      const pos = clamp(scrollLeft + childWidth * direction, 0, maxScrollLeft);

      list.scrollTo(pos, 0);
    }
  };

  const handleScroll = () => {
    const { timeoutId } = stateRef.current;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    stateRef.current.timeoutId = setTimeout(() => {
      validateBtns();
      stateRef.current.timeoutId = undefined;
    }, 100) as unknown as number;
  };

  const handlePrevClick = (event: MouseEvent) => {
    if (isPrevEnabled) {
      scrollList(-1);
    }
  };

  const handleNextClick = (event: MouseEvent) => {
    if (isNxtEnabled) {
      scrollList(1);
    }
  };

  return (
    <div
      ref={ref}
      className={clsx("horizontal-list-wrapper", className, {
        "prev-disabled": !isPrevEnabled,
        "nxt-disabled": !isNxtEnabled,
      })}
      {...others}
    >
      <div className="horizontal-list-prev-btn" onClick={handlePrevClick} />
      <div ref={listRef} className="horizontal-list" onScroll={handleScroll}>
        {children}
      </div>
      <div className="horizontal-list-nxt-btn" onClick={handleNextClick} />
    </div>
  );
};

export default forwardRef(BlmHorizontalList);
