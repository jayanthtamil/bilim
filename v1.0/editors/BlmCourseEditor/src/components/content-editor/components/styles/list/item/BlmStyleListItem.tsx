import React from "react";
import clsx from "clsx";

import { StyleListItem } from "types";
import "./styles.scss";

export interface CompProps {
  data: StyleListItem;
  selected: boolean;
  onClick?: (data: StyleListItem) => void;
}

function BlmStyleListItem(props: CompProps) {
  const { data, selected, onClick } = props;
  const { name, url } = data;

  const handleClick = () => {
    if (onClick) {
      onClick(data);
    }
  };

  return (
    <div
      className={clsx("style-list-item-wrapper", {
        selected,
      })}
      onClick={handleClick}
    >
      {url && <img src={url} alt={name} />}
      <span>{name}</span>
    </div>
  );
}

export default BlmStyleListItem;
