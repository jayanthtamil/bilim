import * as actions from "../types";

export const initState: actions.OthersState = {
  vimeo: {},
};

export default function otherReducer(
  state = initState,
  action: actions.OtherActions
): actions.OthersState {
  switch (action.type) {
    case actions.GET_VIMEO_VIDEO_SUCCESS:
      const { payload, meta } = action;
      const { id } = meta;

      if (Array.isArray(payload) && payload[0] && id) {
        return {
          ...state,
          vimeo: {
            ...state.vimeo,
            [id]: payload[0],
          },
        };
      }

      return state;
    default:
      return state;
  }
}
