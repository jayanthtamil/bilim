import { combineReducers } from "redux";

import core from "./core";
import dialog from "./dialog";
import loader from "./loader";

const rootReducer = combineReducers({
  core,
  dialog,
  loader,
});

export type EditorState = ReturnType<typeof rootReducer>;

export default rootReducer;
