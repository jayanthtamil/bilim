import { createSelector } from "reselect";

import { Loader } from "types";
import { RootState } from "redux/types";

const getLoaderItems = (state: RootState) => state.editor.loader.items;

export const makeGetIsLoading = (...types: string[]) => {
  return createSelector([getLoaderItems], (items: Loader[]) => {
    if (items) {
      return items.some((item) => types.includes(item.type));
    }
    return false;
  });
};
