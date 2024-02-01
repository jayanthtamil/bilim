import React, { forwardRef, ForwardRefRenderFunction, HTMLAttributes, MouseEvent } from "react";
import clsx from "clsx";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";

import { SoundComponent } from "types";
import "./styles.scss";

export interface CompProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  data: SoundComponent;
  isSelected?: boolean;
  drag?: DraggableProvidedDragHandleProps;
  isDeletable?: boolean;
  onClick?: (data: SoundComponent) => void;
  onDelete?: (data: SoundComponent) => void;
  onDuplicate?: (index: number) => void;
  index?: number;
}

const BlmSoundCard: ForwardRefRenderFunction<HTMLDivElement, CompProps> = (props, ref) => {
  const {
    data,
    isSelected,
    isDeletable,
    drag,
    className,
    onClick,
    onDelete,
    onDuplicate,
    index,
    ...other
  } = props;
  const { media } = data.value;
  const { name } = media || {};

  const handleClick = (event: MouseEvent) => {
    if (onClick) {
      onClick(data);
    }
  };

  const handleDeleteClick = (event: MouseEvent) => {
    if (isDeletable && onDelete) {
      onDelete(data);
    }
  };

  const handleDuplicateClick = () => {
    if (onDuplicate && (index || index === 0)) {
      onDuplicate(index);
    }
  };

  return (
    <div
      ref={ref}
      className={clsx("sound-card-wrapper", className, {
        selected: isSelected,
        deletable: isDeletable,
      })}
      {...other}
    >
      <div className="sound-card-box" onClick={handleClick}>
        <div className="sound-card-lbl">{name}</div>
        {drag && <div className="sound-card-drag-btn" {...drag} />}
      </div>
      <div>
        <div className="sound-card-delete-btn" onClick={handleDeleteClick} />
        <div className="sound-card-duplicate-btn" onClick={handleDuplicateClick} />
      </div>
    </div>
  );
};

export default forwardRef(BlmSoundCard);
