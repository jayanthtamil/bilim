import React from "react";
import clsx from "clsx";

import { TemplateBase } from "types";
import "./varaint-list-item.scss";

interface CompProps {
  data: TemplateBase;
  bgChecked: boolean;
  selected: boolean;
  showWarning?: boolean;
  onClick: (template: TemplateBase) => void;
}

function BlmVariantListItem(props: CompProps) {
  const { data, bgChecked, selected, showWarning, onClick } = props;
  const { name, thumbnailLight, thumbnailDark } = data;

  const handleClick = () => {
    if (!showWarning && onClick) {
      onClick(data);
    }
  };

  return (
    <div
      className={clsx("variant-item-wrapper", {
        dark: bgChecked,
        selected: selected,
        warning: showWarning,
      })}
      onClick={handleClick}
    >
      <img
        src={bgChecked ? thumbnailDark : thumbnailLight}
        alt={name}
        className="variant-item-img"
      />
    </div>
  );
}

export default BlmVariantListItem;
