import React from "react";

import { StyleListCategory, StyleListItem, CustomChangeEvent } from "types";
import { StyleListTypes } from "editor-constants";
import { isStyleCategories } from "utils";
import BlmStyleListItem from "./item";
import { ContainerProps } from "./container";
import "./styles.scss";

export type StyleListChangeEvent = CustomChangeEvent<string>;

export interface CompProps extends ContainerProps {
  type: StyleListTypes;
  name: string;
  data?: string;
  onChange?: (event: StyleListChangeEvent) => void;
}

function BlmStyleList(props: CompProps) {
  const { name, data, styleConfig, onChange } = props;
  const { items, classNames } = styleConfig || {};
  const currentStyle = classNames && (data && classNames.includes(data) ? data : classNames[0]);

  const updateChange = (value: string) => {
    if (onChange) {
      onChange({ target: { name, value } });
    }
  };

  const handleItemClick = (item: StyleListItem) => {
    updateChange(item.className);
  };

  const renderItems = (items: StyleListItem[]) => {
    return (
      <div className="style-list-items-wrapper">
        {items.map((item, ind) => (
          <BlmStyleListItem
            key={ind}
            data={item}
            selected={item.className === currentStyle}
            onClick={handleItemClick}
          />
        ))}
      </div>
    );
  };

  const renderCategories = (categories: StyleListCategory[]) => {
    return categories.map((category, ind) => {
      const { name, items } = category;

      return (
        <div key={ind} className="style-list-categories-wrapper">
          <div className="style-list-category-title">{name}</div>
          {renderItems(items)}
        </div>
      );
    });
  };

  if (items) {
    return (
      <div className="style-list-wrapper">
        <div className="styles-list-scroller custom-scrollbar">
          {isStyleCategories(items) ? renderCategories(items) : renderItems(items)}
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export default BlmStyleList;
