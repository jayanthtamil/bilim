import React, { Fragment, useState, useContext, MouseEvent } from "react";
import clsx from "clsx";
import { Collapse } from "@material-ui/core";

import { TemplateCategory } from "types";
import { hasSubCategory } from "utils";
import { createCategoryList } from "../utils";
import CategoryListContext from "../CategoryListContext";
import "./category-list-item.scss";

export interface CompProps {
  data: TemplateCategory;
}

function isInitialyOpened(category: TemplateCategory, selected?: TemplateCategory) {
  if (hasSubCategory(category) && selected) {
    let parent = selected.parent;

    while (parent) {
      if (parent === category) {
        return true;
      }
      parent = parent.parent;
    }
  }
  return false;
}

function BlmCategoryListItem(props: CompProps) {
  const { data } = props;
  const { name, description } = data;
  const { selectedCategory, onCategoryItemClick } = useContext(CategoryListContext);
  const [open, setOpen] = useState(() => isInitialyOpened(data, selectedCategory));

  const handleClick = (event: MouseEvent) => {
    if (onCategoryItemClick) {
      onCategoryItemClick(data);
    }
  };

  const handleCollapseClick = (event: MouseEvent) => {
    setOpen(!open);
  };

  const createChildren = () => {
    if (hasSubCategory(data)) {
      return (
        <Fragment>
          <div className="category-item-wrapper" onClick={handleCollapseClick}>
            <div className={clsx("category-item-switch", { open })} />
            <span>{description ? description : name}</span>
          </div>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {createCategoryList(data.children as TemplateCategory[])}
          </Collapse>
        </Fragment>
      );
    } else {
      return (
        <div className="category-item-lbl" onClick={handleClick}>
          <span>{description ? description : name}</span>
        </div>
      );
    }
  };

  return (
    <li
      className={clsx("category-list-item", {
        selected: selectedCategory?.id === data.id,
      })}
    >
      {createChildren()}
    </li>
  );
}

export default BlmCategoryListItem;
