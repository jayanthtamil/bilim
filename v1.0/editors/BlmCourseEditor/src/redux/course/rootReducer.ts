import { combineReducers } from "redux";

import properties from "./properties";
import structure from "./structure";
import style from "./style";
import element from "./element";
import file from "./file";

const rootReducer = combineReducers({
  properties,
  structure,
  style,
  element,
  file,
});

export type CourseState = ReturnType<typeof rootReducer>;

export default rootReducer;
