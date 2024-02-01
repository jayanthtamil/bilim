import * as actions from "../types";

export const initState: actions.DialogsState = {
  items: [],
};

export default function dialogsReducer(
  state = initState,
  action: actions.DialogActions
): actions.DialogsState {
  if (action.type === actions.OPEN_DIALOG || action.type === actions.OPEN_CONFIRM_DIALOG) {
    const dialog = { ...action.payload.dialog };
    return { ...state, items: [...state.items, dialog] };
  } else if (action.type === actions.CLOSE_DIALOG) {
    return {
      ...state,
      items: state.items.filter((dialog) => dialog.id !== action.payload.id),
    };
  } else {
    return state;
  }
}
