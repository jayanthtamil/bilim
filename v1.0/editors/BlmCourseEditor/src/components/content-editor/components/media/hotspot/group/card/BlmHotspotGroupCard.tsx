import React, { ChangeEvent, forwardRef, ForwardRefRenderFunction, HTMLAttributes } from "react";
import clsx from "clsx";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";

import { CustomChangeEvent, MediaHotspotGroupItem } from "types";
import { BlmColorPicker, ColorPickerColor } from "shared";
import "./styles.scss";

export interface CompProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  data: MediaHotspotGroupItem;
  showDelete?: boolean;
  drag?: DraggableProvidedDragHandleProps;
  onChange?: (data: MediaHotspotGroupItem) => void;
  onDelete?: (data: MediaHotspotGroupItem) => void;
}

const BlmHotspotGroupCard: ForwardRefRenderFunction<HTMLDivElement, CompProps> = (props, ref) => {
  const { data, showDelete = true, drag, className, onChange, onDelete, ...others } = props;
  const { name, color } = data;

  const updateChange = (newData: MediaHotspotGroupItem) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (event: ChangeEvent<any> | CustomChangeEvent<ColorPickerColor>) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData = { ...data };

    if (name === "name") {
      newData[name] = value;
    } else if (name === "color") {
      newData[name] = (value as ColorPickerColor).color!;
    }

    updateChange(newData);
  };

  const handleDeleteClick = () => {
    if (showDelete && onDelete) {
      onDelete(data);
    }
  };

  return (
    <div
      ref={ref}
      className={clsx("hotspot-group-card-wrapper", className, { deletable: showDelete })}
      {...others}
    >
      <div className="hotspot-group-card-box">
        <input
          type="text"
          name="name"
          value={name}
          className="hotspot-group-name-txt"
          onChange={handleChange}
        />
        <BlmColorPicker
          name="color"
          color={color}
          hideClear={false}
          className="hotspot-group-color-picker"
          onChange={handleChange}
        />
        <div className="hotspot-group-drag-btn" {...drag} />
      </div>
      <div className="hotspot-group-delete-btn" onClick={handleDeleteClick} />
    </div>
  );
};

export default forwardRef(BlmHotspotGroupCard);
