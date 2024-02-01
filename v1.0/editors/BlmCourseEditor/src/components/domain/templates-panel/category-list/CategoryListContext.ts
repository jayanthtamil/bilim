import { createContext } from "react";

import { TemplateCategory } from "types";

export interface Context {
  selectedCategory?: TemplateCategory;
  onCategoryItemClick?: (category: TemplateCategory) => void;
}

const CategoryListContext = createContext<Context>({
  selectedCategory: undefined,
  onCategoryItemClick: undefined,
});

export default CategoryListContext;
