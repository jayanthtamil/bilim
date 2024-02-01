import * as actions from "../types";

export const initState: actions.UserState = {
  accessToken: undefined,
  isAuthorized: undefined,
};

export default function userReducer(
  state = initState,
  action: actions.UserActions
): actions.UserState {
  switch (action.type) {
    case actions.GET_AUTHORIZATION_STARTED:
      return {
        ...state,
        isAuthorized: undefined,
      };
    case actions.GET_AUTHORIZATION_SUCCESS:
      const { access_token, csrf_token } = action.payload;

      return {
        ...state,
        accessToken: access_token,
        csrfToken: csrf_token,
        isAuthorized: true,
      };
    case actions.GET_AUTHORIZATION_ERROR:
      return {
        ...state,
        isAuthorized: false,
      };
    default:
      return state;
  }
}
