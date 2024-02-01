import React, { MouseEvent } from "react";
import clsx from "clsx";

import { Theme } from "types";
import "./list-item-styles.scss";

export interface CompProps {
  data: Theme;
  selected: boolean;
  onClick: (theme: Theme) => void;
}

function BlmThemeListItem(props: CompProps) {
  const { data, selected, onClick } = props;
  const { name, url } = data;

  const handleClick = (event: MouseEvent) => {
    if (onClick) {
      onClick(data);
    }
  };

  return (
    <div className={clsx("theme-list-item-container", { selected })}>
      <img src={url} alt={name} className="theme-image" onClick={handleClick} />
      <div className="theme-icon" />
      <div className="theme-name">{name}</div>
    </div>
  );
}

export default BlmThemeListItem;
