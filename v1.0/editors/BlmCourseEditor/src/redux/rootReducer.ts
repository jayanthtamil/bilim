import { combineReducers, CombinedState, Reducer } from "redux";

import { RootActions, RootState } from "./types";
import user from "./user";
import domain from "./domain";
import course from "./course";
import editor from "./editor";
import others from "./others";
import crossSliceReducer from "./crossReducer";

export const reducers = {
  user,
  domain,
  course,
  editor,
  others,
};

const combinedReducer = combineReducers(reducers);

const rootReducer: Reducer<CombinedState<RootState>, RootActions> = (state, action) => {
  const intermediateState = combinedReducer(state, action);
  const finalState = crossSliceReducer(intermediateState, action);

  return finalState;
};

export default rootReducer;
