import React, { useRef, useEffect } from "react";

import { ContainerProps } from "./loaders-container";

interface CompProps extends ContainerProps {}

function BlmLoaders(props: CompProps) {
  const { loaders } = props;
  const divRef = useRef<HTMLDivElement | null>(null);
  const showLoader = loaders.length > 0;

  useEffect(() => {
    const container = divRef.current;

    if (container) {
      const clsName = "busy-cursor";
      const body = container.ownerDocument.body;
      const hasClass = body.classList.contains(clsName);

      if (showLoader && !hasClass) {
        body.classList.add(clsName);
      } else if (!showLoader && hasClass) {
        body.classList.remove(clsName);
      }
    }
  }, [showLoader]);

  return <div ref={divRef} style={{ display: "none" }} />;
}

export default BlmLoaders;
