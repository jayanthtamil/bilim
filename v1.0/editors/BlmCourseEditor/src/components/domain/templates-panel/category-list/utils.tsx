import React, { ReactNode } from "react";
import { Divider } from "@material-ui/core";

import { TemplateCategory } from "types";
import { TemplateMenu } from "editor-constants";
import { hasCategory } from "utils";
import BlmCategoryListItem from "./category-list-item";

export function createMainList(categories: TemplateCategory[]) {
  return categories.reduce((lists, category, ind) => {
    if (hasCategory(category)) {
      const list = createCategoryList(category.children, category.id);

      if (lists.length) {
        lists.push(<Divider key={ind + "divider"} className="category-list-divider" />);
      }

      lists.push(list);
    }

    return lists;
  }, [] as ReactNode[]);
}

export function createCategoryList(categories: TemplateCategory[], key = "0") {
  const len = categories.length;
  const items = [];

  for (var i = 0; i < len; i++) {
    const category = categories[i];

    if (category.menu === TemplateMenu.Left) {
      const item = createItem(category, i);
      items.push(item);
    }
  }

  return (
    <ul key={key} className="category-list">
      {items}
    </ul>
  );
}

function createItem(category: TemplateCategory, index: number) {
  return <BlmCategoryListItem key={index} data={category} />;
}
