import { fetchAPI } from "redux/api";
import * as actions from "../types";

export const getVimeoVideo = (id: string) => {
  return fetchAPI({
    url: `https://vimeo.com/api/v2/video/${id}.json`,
    method: "GET",
    headers: {},
    authenticated: false,
    meta: { id },
    types: [
      actions.GET_VIMEO_VIDEO_STARTED,
      actions.GET_VIMEO_VIDEO_SUCCESS,
      actions.GET_VIMEO_VIDEO_ERROR,
    ],
  });
};
