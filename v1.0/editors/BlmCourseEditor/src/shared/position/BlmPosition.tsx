import React from "react";
import clsx from "clsx";

import { CustomChangeEvent } from "types";
import { Positions, MediaPosition, MediaBackgroundPosition } from "editor-constants";
import "./styles.scss";

export type PositionChangeEvent = CustomChangeEvent<
  Positions | MediaPosition | MediaBackgroundPosition
>;

export interface CompProps {
  name: string;
  type?: "standard" | "limited";
  value?: Positions | MediaPosition | MediaBackgroundPosition;
  media?: string;
  onChange?: (event: PositionChangeEvent) => void;
}

function BlmPosition(props: CompProps) {
  const { name, type, value, media, onChange } = props;

  const getAllPosition = (media: string | undefined) => {
    if (media === "media-item") {
      return Object.values(MediaPosition);
    } else if (media === "background-media-item") {
      return Object.values(MediaBackgroundPosition);
    } else {
      return Object.values(Positions);
    }
  };

  const ALL_POSITIONS = getAllPosition(media);

  const LIMITED_POSITIONS = [Positions.Top, Positions.Right, Positions.Bottom, Positions.Left];

  const items = type === "limited" ? LIMITED_POSITIONS : ALL_POSITIONS;

  const handleClick = (position: Positions | MediaPosition | MediaBackgroundPosition) => {
    if (onChange) {
      onChange({ target: { name, value: position } });
    }
  };

  return (
    <div className={clsx("position-wrapper", type, value)}>
      {(items as Array<MediaPosition | Positions | MediaBackgroundPosition>).map((item) => (
        <div
          key={item}
          className={clsx("position-item", item, { selected: item === value })}
          onClick={() => handleClick(item)}
        />
      ))}
    </div>
  );
}

export default BlmPosition;
