import React, { HTMLAttributes, MouseEvent, useMemo, useState } from "react";
import clsx from "clsx";

import { DragGeometry, HandleRoles, IConstraint } from "./types";
import { useTransformContext } from "./utils";
import BlmTransformHandle from "./BlmTransformHandle";
import "./styles.scss";

export interface TrasnformProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  data?: DragGeometry;
  hanldes?: string;
  constraints?: IConstraint[];
  onChange?: (data: DragGeometry) => void;
}

const defaultHandles = ["n", "e", "s", "w", "ne", "se", "nw", "sw"];

function BlmTransformComponent(props: TrasnformProps) {
  const { data, hanldes, constraints, children, className, onMouseDown, onChange, ...others } =
    props;
  const [drag, setDrag] = useState<DragGeometry>();
  const transform = useTransformContext();
  const curHandles = hanldes === "all" ? defaultHandles : hanldes?.split(",");

  const styles = useMemo(() => {
    const { x = 0, y = 0, width = 0, height = 0 } = drag ?? data ?? {};

    return {
      left: x,
      top: y,
      width,
      height,
    };
  }, [data, drag]);

  const startDrag = (event: MouseEvent, role: number) => {
    if (data) {
      const model = { ...data, rotation: 0 };

      transform.startDrag(event, role, model, setDrag, constraints, onChange);
    }
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    startDrag(event, HandleRoles.MOVE);

    if (onMouseDown) {
      onMouseDown(event);
    }
  };

  const handleChildMouseDown = (event: MouseEvent, role: number) => {
    startDrag(event, role);
  };

  return (
    <div
      style={styles}
      className={clsx("transform-wrapper", className)}
      onMouseDown={handleMouseDown}
      {...others}
    >
      {children}
      {curHandles?.map((item) => (
        <BlmTransformHandle key={item} type={item} onMouseDown={handleChildMouseDown} />
      ))}
    </div>
  );
}

export default BlmTransformComponent;
