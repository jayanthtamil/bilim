import { fetchAPI } from "redux/api";
import * as actions from "../types";

export const getUserAuthorization = () => {
  return fetchAPI({
    url: "service/checkaccess",
    method: "GET",
    authenticated: false,
    types: [
      actions.GET_AUTHORIZATION_STARTED,
      actions.GET_AUTHORIZATION_SUCCESS,
      actions.GET_AUTHORIZATION_ERROR,
    ],
  });
};
