import { ApiResultAction } from "redux/types";

export interface VimeoVideo {
  thumbnail_medium: string;
}

export interface OthersState {
  vimeo: { [id: string]: VimeoVideo };
}

export const GET_VIMEO_VIDEO_STARTED = "GET_VIMEO_VIDEO_STARTED";
export const GET_VIMEO_VIDEO_SUCCESS = "GET_VIMEO_VIDEO_SUCCESS";
export const GET_VIMEO_VIDEO_ERROR = "GET_VIMEO_VIDEO_ERROR";

type GetVimeoVideoActions = ApiResultAction<
  typeof GET_VIMEO_VIDEO_STARTED | typeof GET_VIMEO_VIDEO_SUCCESS | typeof GET_VIMEO_VIDEO_ERROR
>;

export type OtherActions = GetVimeoVideoActions;
