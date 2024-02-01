import * as actions from "../types";

export const initState: actions.LoadersState = {
  items: [],
};

export default function loadersReducer(
  state = initState,
  action: actions.LoaderActions
): actions.LoadersState {
  if (action.type === actions.ADD_LOADER) {
    return { ...state, items: [...state.items, action.payload] };
  } else if (action.type === actions.REMOVE_LOADER) {
    return {
      ...state,
      items: state.items.filter((loader) => loader.id !== action.payload),
    };
  } else {
    return state;
  }
}
