import React, { CSSProperties, HTMLAttributes, MouseEvent, useMemo } from "react";
import clsx from "clsx";
import clamp from "lodash/clamp";

import { MediaHotspotGroups, MediaHotspotItem } from "types";
import { StyleListTypes } from "editor-constants";
import { BlmHTMLParser } from "shared";
import { findObject } from "utils";
import { getDefaultComponentStyle } from "components/content-editor/reducers";
import { useHotspotItemStyle } from "./styles";

export interface CompProps extends HTMLAttributes<HTMLDivElement> {
  data: MediaHotspotItem;
  groups: MediaHotspotGroups;
  styleType: StyleListTypes;
  translationX?: number;
  translationY?: number;
  selected?: boolean;
  onDelete?: (data: MediaHotspotItem) => void;
}

function BlmHotspotItem(props: CompProps) {
  const {
    data,
    groups,
    styleType,
    translationX = 0,
    translationY = 0,
    selected,
    style,
    className,
    onDelete,
    ...others
  } = props;

  const {
    x,
    y,
    name,
    media,
    groupId,
    hasDark,
    position,
    size,
    callToAction,
    style: styleName = getDefaultComponentStyle(styleType),
  } = data;
  const classes = useHotspotItemStyle();

  const group = useMemo(() => {
    if (groups.enabled && groupId) {
      return findObject(groups.items, groupId, "id");
    }
  }, [groups, groupId]);

  const handleDelete = (event: MouseEvent) => {
    event.stopPropagation();

    if (onDelete) {
      onDelete(data);
    }
  };

  return (
    <div
      blm-role="hotspot"
      blm-order="1"
      blm-calltoaction={callToAction.toString()}
      blm-position={position}
      blm-size={size}
      blm-action="action"
      style={
        {
          ...style,
          left: clamp(x + translationX, 0, 100) + "%",
          top: clamp(y + translationY, 0, 100) + "%",
          "--blm_group_color": group?.color,
        } as CSSProperties
      }
      className={clsx(classes.root, styleName, { [classes.selected]: selected, light: !hasDark })}
      {...others}
    >
      <div className="mediawrapper">
        <img src={media?.url} alt="" />
      </div>
      <div className="hotspotlabel">
        <span>{name !== "" ? <BlmHTMLParser html={name} /> : name}</span>
      </div>
      <div className={classes.deleteWrapper}>
        <div className={classes.deleteBtn} onClick={handleDelete} />
      </div>
    </div>
  );
}

export default BlmHotspotItem;
