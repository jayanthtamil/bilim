import { AnyAction } from "redux";
import { createAction } from "redux-api-middleware";

import { SimpleObject } from "types";
import { createUUID } from "utils";
import { BASE_URL, API_DEFAULT_QUERY_STRING } from "config";
import { RootState, RSAAThunkAction } from "redux/types";
import { addLoader, removeLoader } from "redux/actions";

interface APIParam {
  url: string;
  types: string[];
  method?: "GET" | "PUT" | "PATCH" | "POST" | "DELETE";
  headers?: SimpleObject;
  body?: BodyInit;
  authenticated?: boolean;
  meta?: object | string;
  query?: string;
}

export function fetchAPI({
  url,
  types,
  method = "GET",
  authenticated = true,
  headers,
  body,
  meta,
  query = "",
}: APIParam): RSAAThunkAction {
  return (dispatch, getState) => {
    const [started, success, error] = types;
    const endpoint = /^https?:\/\//.test(url)
      ? url
      : `${BASE_URL}${url}${API_DEFAULT_QUERY_STRING}${query}`;
    const loaderId = createUUID();
    const {
      user: { accessToken, csrfToken },
    } = getState();

    //We neeed to omit content-type header for the Fetch request. Then the browser will automatically add the Content type header including the Form Boundary.
    const createHeaders = (state: RootState): HeadersInit => {
      const result = headers || { "Content-Type": "application/json", Accept: "application/json" };

      if (!result.Accept) {
        result.Accept = "*/*";
      }

      if (authenticated && accessToken) {
        result.Authorization = `Bearer ${accessToken}`;
      }

      if (authenticated && method === "POST" && csrfToken) {
        result["X-CSRF-Token"] = csrfToken;
      }

      return result;
    };

    const customFetch: typeof fetch = async (...args) => {
      const response = await fetch(...args);
      const result = response.clone();
      const resContentType = response.headers.get("Content-Type");

      hideLoader();

      if (resContentType && ~resContentType.indexOf("json")) {
        const json = await response.json();

        if (json.error_no) {
          let { error_no, access_token } = json;

          if (!(error_no === "0" && access_token && access_token !== "")) {
            return new Response(result.body, {
              status: 500,
              headers: result.headers,
            });
          }
        }
      }

      return result;
    };

    const handleSuccessPayload = (action: AnyAction, state: RootState, response: Response) => {
      return getResponseBody(response);
    };

    const getResponseBody = (response: Response) => {
      const resContentType = response.headers.get("Content-Type");

      if (resContentType && ~resContentType.indexOf("json")) {
        return response.json().then((json) => {
          return json;
        });
      } else {
        return response.text().then((text) => {
          return text;
        });
      }
    };

    const showLoader = () => {
      dispatch(addLoader(loaderId, started));
    };

    const hideLoader = () => {
      dispatch(removeLoader(loaderId));
    };

    showLoader();

    const rsaaAction = createAction({
      endpoint,
      method,
      headers: createHeaders,
      body,
      fetch: customFetch,
      types: [
        {
          type: started,
          meta,
        },
        {
          type: success,
          meta,
          payload: handleSuccessPayload,
        },
        {
          type: error,
          meta,
        },
      ],
    });

    return dispatch(rsaaAction);
  };
}
