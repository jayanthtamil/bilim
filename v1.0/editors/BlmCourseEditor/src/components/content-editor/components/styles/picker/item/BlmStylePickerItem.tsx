import React from "react";
import clsx from "clsx";

import { StyleListItem } from "types";
import "./styles.scss";

export interface CompProps {
  data: StyleListItem;
  selected: boolean;
  onClick?: (data: StyleListItem) => void;
}

function BlmStylePickerItem(props: CompProps) {
  const { data, selected, onClick } = props;
  const { name, url, overUrl } = data;

  const handleClick = () => {
    if (onClick) {
      onClick(data);
    }
  };

  return (
    <div
      title={name}
      className={clsx("style-picker-item-wrapper", {
        selected,
        "has-over": overUrl,
      })}
      onClick={handleClick}
    >
      {url && <img src={url} alt={name} />}
      {overUrl && <img src={overUrl} alt={name} />}
    </div>
  );
}

export default BlmStylePickerItem;
