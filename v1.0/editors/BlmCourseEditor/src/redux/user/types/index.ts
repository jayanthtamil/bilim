import { ApiResultAction } from "redux/types";

// Describing the shape of the slice of state
export interface UserState {
  isAuthorized?: boolean;
  accessToken?: string;
  csrfToken?: string;
}

// Describing the different ACTION NAMES available
export const GET_AUTHORIZATION_STARTED = "GET_AUTHORIZATION_STARTED";
export const GET_AUTHORIZATION_SUCCESS = "GET_AUTHORIZATION_SUCCESS";
export const GET_AUTHORIZATION_ERROR = "GET_AUTHORIZATION_ERROR";

type AuthoizationActions = ApiResultAction<
  | typeof GET_AUTHORIZATION_STARTED
  | typeof GET_AUTHORIZATION_SUCCESS
  | typeof GET_AUTHORIZATION_ERROR
>;

export type UserActions = AuthoizationActions;
