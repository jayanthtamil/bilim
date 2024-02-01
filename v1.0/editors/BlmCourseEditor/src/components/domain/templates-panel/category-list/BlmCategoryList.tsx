import React, { Fragment, useState, MouseEvent } from "react";

import { TemplateCategory } from "types";
import BlmTemplateList from "../template-list";
import CategoryListContext from "./CategoryListContext";
import { createMainList } from "./utils";
import "./category-list.scss";

export interface CompProps {
  categories: TemplateCategory[];
  selectedCategory?: TemplateCategory;
  isDark?: boolean;
  onClose: (event: MouseEvent) => void;
}

function BlmCategoryList(props: CompProps) {
  const { categories, selectedCategory: pSelectedCategory, isDark, onClose } = props;
  const [selectedCategory, setSelectedCategory] = useState(pSelectedCategory);
  const [showTemplates, setShowTemplates] = useState(Boolean(selectedCategory));

  const handleItemClick = (category: TemplateCategory) => {
    setSelectedCategory(category);
    setShowTemplates(true);
  };

  const handleTemplateCloseClick = (event: MouseEvent) => {
    setShowTemplates(false);
  };

  const handleCloseClick = (event: MouseEvent) => {
    if (onClose) {
      onClose(event);
    }
  };

  return (
    <Fragment>
      <CategoryListContext.Provider
        value={{
          selectedCategory,
          onCategoryItemClick: handleItemClick,
        }}
      >
        <div className="category-list-panel">
          <div className="category-list-scroller custom-scrollbar">
            {categories && createMainList(categories)}
          </div>
          <div className="category-list-close-btn" onClick={handleCloseClick} />
        </div>
      </CategoryListContext.Provider>
      {selectedCategory && (
        <BlmTemplateList
          data={selectedCategory}
          show={showTemplates}
          isDark={isDark}
          onCloseClick={handleTemplateCloseClick}
        />
      )}
    </Fragment>
  );
}

export default BlmCategoryList;
