import React, { MouseEvent } from "react";
import clsx from "clsx";

import { HandleRoles } from "./types";

export interface TransformHandleProps {
  type: string;
  onMouseDown: (event: MouseEvent, role: number) => void;
}

function BlmTransformHandle(props: TransformHandleProps) {
  const { type, onMouseDown } = props;

  const getRole = () => {
    if (type === "n") {
      return HandleRoles.RESIZE_UP;
    } else if (type === "e") {
      return HandleRoles.RESIZE_RIGHT;
    } else if (type === "s") {
      return HandleRoles.RESIZE_DOWN;
    } else if (type === "w") {
      return HandleRoles.RESIZE_LEFT;
    } else if (type === "ne") {
      return HandleRoles.RESIZE_UP + HandleRoles.RESIZE_RIGHT;
    } else if (type === "se") {
      return HandleRoles.RESIZE_DOWN + HandleRoles.RESIZE_RIGHT;
    } else if (type === "nw") {
      return HandleRoles.RESIZE_UP + HandleRoles.RESIZE_LEFT;
    } else if (type === "sw") {
      return HandleRoles.RESIZE_DOWN + HandleRoles.RESIZE_LEFT;
    } else {
      return HandleRoles.NO_ROLE;
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    const role = getRole();

    if (onMouseDown) {
      onMouseDown(event, role);
    }
  };

  return <div className={clsx("transform-handle-wrapper", type)} onMouseDown={handleMouseDown} />;
}

export default BlmTransformHandle;
