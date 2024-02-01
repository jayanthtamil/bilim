import React, { forwardRef, ForwardRefRenderFunction, HTMLAttributes } from "react";
import clsx from "clsx";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { Tooltip } from "@material-ui/core";

import { MediaHotspotGroupItem, MediaHotspotItem } from "types";
import "./styles.scss";

export interface CompProps extends HTMLAttributes<HTMLDivElement> {
  data: MediaHotspotItem;
  group?: MediaHotspotGroupItem;
  drag?: DraggableProvidedDragHandleProps;
}

const BlmHotspotCard: ForwardRefRenderFunction<HTMLDivElement, CompProps> = (props, ref) => {
  const { data, group, drag, className, ...others } = props;
  const { name } = data;

  let newName = document.createElement("div");
  newName.innerHTML = name;

  return (
    <div ref={ref} className={clsx("hotspot-card-wrapper", className)} {...others}>
      <Tooltip interactive title={group?.name || ""} placement="right-start">
        <div
          title={group?.name}
          style={{ backgroundColor: group?.color || "transparent" }}
          className="hotspot-card-icon"
        />
      </Tooltip>
      <div className="hotspot-card-lbl">
        <span>{newName.textContent}</span>
      </div>
      <div className="hotspot-card-drag-btn" {...drag} />
    </div>
  );
};

export default forwardRef(BlmHotspotCard);
