import { Loader } from "types";

export const ADD_LOADER = "ADD_LOADER";
export const REMOVE_LOADER = "REMOVE_LOADER";

export interface LoadersState {
  items: Loader[];
}

export interface AddLoaderAction {
  type: typeof ADD_LOADER;
  payload: Loader;
}

export interface RemoveLoaderAction {
  type: typeof REMOVE_LOADER;
  payload: string;
}

export type LoaderActions = AddLoaderAction | RemoveLoaderAction;
