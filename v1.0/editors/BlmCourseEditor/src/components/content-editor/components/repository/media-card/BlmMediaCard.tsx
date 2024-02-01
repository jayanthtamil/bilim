import React, {
  forwardRef,
  ForwardRefRenderFunction,
  Fragment,
  HTMLAttributes,
  MouseEvent,
  useMemo,
} from "react";
import clsx from "clsx";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";

import { MediaComponent } from "types";
import { MediaVariants } from "editor-constants";
import {
  isMediaImage,
  isMediaButton,
  isMediaSlideshow,
  getActionDetails,
  isMediaHotspot,
  isMediaFlipCard,
  isMediaHotspot360,
} from "utils";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps, Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  data: MediaComponent;
  order: number;
  isSelected?: boolean;
  drag?: DraggableProvidedDragHandleProps;
  isDeletable?: boolean;
  isMediaDuplicate?: boolean;
  onClick?: (data: MediaComponent) => void;
  onDelete?: (data: MediaComponent) => void;
  onDuplicate?: (index: number) => void;
  index?: number;
}

function getLabel(media?: MediaVariants) {
  switch (media) {
    case MediaVariants.Image:
      return "Image";
    case MediaVariants.Slideshow:
      return "Slideshow";
    case MediaVariants.Button:
      return "Button";
    case MediaVariants.FlipCard:
      return "Flipcard";
    case MediaVariants.Video:
      return "Video";
    case MediaVariants.VideoStandard:
      return "Video Standard";
    case MediaVariants.VideoExternal:
      return "Video External";
    case MediaVariants.SynchroVideo:
      return "Synchro Video";
    case MediaVariants.Custom:
      return "Custom";
    case MediaVariants.Target:
      return "Target";
    case MediaVariants.Hotspot:
    case MediaVariants.Hotspot360:
      return "Hotspot";
    default:
      return "Media";
  }
}

const getImage = (data: MediaComponent) => {
  if (isMediaImage(data)) {
    return data.value.media;
  } else if (isMediaSlideshow(data)) {
    return data.value.items && data.value.items[0] && data.value.items[0].media;
  } else if (isMediaButton(data)) {
    return data.value.out;
  } else if (isMediaFlipCard(data)) {
    return data.value.recto.media ?? data.value.verso.media;
  } else if (isMediaHotspot(data)) {
    return data.value.media;
  } else if (isMediaHotspot360(data)) {
    return data.value.items[0]?.media;
  }
};

const getTitle = (data: MediaComponent) => {
  if (isMediaButton(data)) {
    return data.value.title;
  }
  if (isMediaFlipCard(data)) {
    return data.value.recto.title;
  }
};

const getAction = (data: MediaComponent) => {
  if (isMediaButton(data) || isMediaFlipCard(data)) {
    return data.value.clickAction;
  }
};

const BlmMediaCard: ForwardRefRenderFunction<HTMLDivElement, CompProps> = (props, ref) => {
  const {
    data,
    order,
    isSelected,
    isDeletable,
    isMediaDuplicate,
    drag,
    className,
    structure,
    onClick,
    onDelete,
    onDuplicate,
    index,
    ...other
  } = props;
  const { variant } = data;
  const image = getImage(data);
  const label = getLabel(variant);
  const mediaAction = getAction(data);
  const [action, params] = useMemo(
    () => getActionDetails(mediaAction, structure),
    [mediaAction, structure]
  );
  
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
      className={clsx("media-card-wrapper", variant, className, {
        selected: isSelected,
        deletable: isDeletable,
        duplicate: isMediaDuplicate
      })}
      {...other}
    >
            <div className="media-card-box" onClick={handleClick}>
        <div className={clsx("media-card-img-wrapper", { "has-image": image })}>
          {image && <img alt={image.name} src={image.url} />}
        </div>
        <div className="media-card-lbl">{label}</div>
        <div className="media-card-title">{getTitle(data)}</div>
        {action && (
          <Fragment>
            <div className="media-card-action">
              <span>{action}</span>
            </div>
            <div
              className={clsx("media-card-parameters", {
                "show-icon": action && !params,
              })}
            >
              <span>{params}</span>
            </div>
          </Fragment>
        )}
        <div className="media-card-order-lbl">{order}</div>
        {drag && <div className="media-card-drag-btn" {...drag} />}
      </div>
      <div className="media-card-main">
        <div className="media-card-delete-btn" onClick={handleDeleteClick} />
        <div className="media-card-duplicate-btn" onClick={handleDuplicateClick} />
      </div>
    </div>
  );
};

export default forwardRef(BlmMediaCard);
