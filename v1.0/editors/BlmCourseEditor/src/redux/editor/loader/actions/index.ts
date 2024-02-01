import { Loader } from "types";
import * as actions from "../types";

export function addLoader(id: string, type: string): actions.AddLoaderAction {
  return {
    type: actions.ADD_LOADER,
    payload: new Loader(id, type),
  };
}

export function removeLoader(id: string): actions.RemoveLoaderAction {
  return {
    type: actions.REMOVE_LOADER,
    payload: id,
  };
}
