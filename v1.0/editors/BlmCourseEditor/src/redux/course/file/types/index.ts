import {
  AnimationMedia,
  AnimationOption,
  AnimationTranslation,
  MediaFile,
  SimpleObject,
} from "types";
import { ApiResultAction } from "redux/types";

export interface FileState {
  files: {
    uploaded: {
      [key: string]: MediaFile[];
    };
    added: MediaFile[];
    removed: MediaFile[];
    loaded: {
      [key: string]: string | SimpleObject | undefined;
    };
  };
  animations: {
    [key: string]: AnimationMedia | undefined;
  };
  properties: {
    [key: string]: { waveform: string } | undefined;
  };
}

export interface FileContent {
  id?: string;
  content: string;
  name: string;
}

export interface FileResponse {
  id: string;
  fileName: string;
  path: string;
  fileSize: number;
  extension: string;
  mimeType: string;
  rootFile: string;
}

export interface FilesResponse {
  file: FileResponse[];
}

export interface AnimationTranslationResponse extends AnimationTranslation {}
export interface AnimationOptionRepsonse extends AnimationOption {}
export interface AnimationOptionsRepsonse {
  [key: string]: AnimationOptionRepsonse;
}

export interface AnimationAttachmentResponse {
  name: string;
  path: string;
  mimeType: string;
}

export interface AnimationResponse {
  translations: AnimationTranslationResponse[];
  options: AnimationOptionsRepsonse[];
  attachments: AnimationAttachmentResponse[];
}

export const UPLOAD_FILE_STARTED = "UPLOAD_FILE_STARTED";
export const UPLOAD_FILE_SUCCESS = "UPLOAD_FILE_SUCCESS";
export const UPLOAD_FILE_ERROR = "UPLOAD_FILE_ERROR";

export const DELETE_FILES_STARTED = "DELETE_FILES_STARTED";
export const DELETE_FILES_SUCCESS = "DELETE_FILES_SUCCESS";
export const DELETE_FILES_ERROR = "DELETE_FILES_ERROR";

export const GET_FILE_STARATED = "GET_FILE_STARATED";
export const GET_FILE_SUCCESS = "GET_FILE_SUCCESS";
export const GET_FILE_ERROR = "GET_FILE_ERROR";

export const CLEAR_FILE = "CLEAR_FILE";
export const ADD_FILES = "ADD_FILES";
export const REMOVE_FILES = "REMOVE_FILES";
export const CLEAR_FILES = "CLEAR_FILES";

export const GET_ANIMATION_STARATED = "GET_ANIMATION_STARATED";
export const GET_ANIMATION_SUCCESS = "GET_ANIMATION_SUCCESS";
export const GET_ANIMATION_ERROR = "GET_ANIMATION_ERROR";

export const UPDATE_ANIMATION_STARATED = "UPDATE_ANIMATION_STARATED";
export const UPDATE_ANIMATION_SUCCESS = "UPDATE_ANIMATION_SUCCESS";
export const UPDATE_ANIMATION_ERROR = "UPDATE_ANIMATION_ERROR";

export const REPLACE_ANIMATION_ATTACHMENT_STARATED = "REPLACE_ANIMATION_ATTACHMENT_STARATED";
export const REPLACE_ANIMATION_ATTACHMENT_SUCCESS = "REPLACE_ANIMATION_ATTACHMENT_SUCCESS";
export const REPLACE_ANIMATION_ATTACHMENT_ERROR = "REPLACE_ANIMATION_ATTACHMENT_ERROR";

export const CLEAR_ANIMATIONS = "CLEAR_ANIMATIONS";

export const GET_MEDIA_PROPERTIES_STARATED = "GET_MEDIA_PROPERTIES_STARATED";
export const GET_MEDIA_PROPERTIES_SUCCESS = "GET_MEDIA_PROPERTIES_SUCCESS";
export const GET_MEDIA_PROPERTIES_ERROR = "GET_MEDIA_PROPERTIES_ERROR";

export const UPDATE_SUBTITLES_STARATED = "UPDATE_SUBTITLES_STARATED";
export const UPDATE_SUBTITLES_SUCCESS = "UPDATE_SUBTITLES_SUCCESS";
export const UPDATE_SUBTITLES_ERROR = "UPDATE_SUBTITLES_ERROR";

export const CLEAR_MEDIA_PROPERTIES = "CLEAR_MEDIA_WAVEFORMS";

type UploadFileActions = ApiResultAction<
  typeof UPLOAD_FILE_STARTED | typeof UPLOAD_FILE_SUCCESS | typeof UPLOAD_FILE_ERROR
>;

type DeleteFilesActions = ApiResultAction<
  typeof DELETE_FILES_STARTED | typeof DELETE_FILES_SUCCESS | typeof DELETE_FILES_ERROR
>;

type GetFileActions = ApiResultAction<
  typeof GET_FILE_STARATED | typeof GET_FILE_SUCCESS | typeof GET_FILE_ERROR
>;

export type ClearFileAction = {
  type: typeof CLEAR_FILE;
  payload: {
    id: string;
  };
};

export type AddFilesAction = {
  type: typeof ADD_FILES;
  payload: {
    medias: MediaFile[];
  };
};

export type RemoveFilesAction = {
  type: typeof REMOVE_FILES;
  payload: {
    medias: MediaFile[];
  };
};

export type ClearFilesAction = {
  type: typeof CLEAR_FILES;
};

type GetAnimationActions = ApiResultAction<
  typeof GET_ANIMATION_STARATED | typeof GET_ANIMATION_SUCCESS | typeof GET_ANIMATION_ERROR
>;

type UpdateAnimationActions = ApiResultAction<
  typeof UPDATE_ANIMATION_STARATED | typeof UPDATE_ANIMATION_SUCCESS | typeof UPDATE_ANIMATION_ERROR
>;

type ReplaceAnimationAttachmentActions = ApiResultAction<
  | typeof REPLACE_ANIMATION_ATTACHMENT_STARATED
  | typeof REPLACE_ANIMATION_ATTACHMENT_SUCCESS
  | typeof REPLACE_ANIMATION_ATTACHMENT_ERROR
>;

export type ClearAnimationsAction = {
  type: typeof CLEAR_ANIMATIONS;
};

type GetMediaPropertiesActions = ApiResultAction<
  | typeof GET_MEDIA_PROPERTIES_STARATED
  | typeof GET_MEDIA_PROPERTIES_SUCCESS
  | typeof GET_MEDIA_PROPERTIES_ERROR
>;

export type ClearMediaPropertiesAction = {
  type: typeof CLEAR_MEDIA_PROPERTIES;
};

export type FileActions =
  | UploadFileActions
  | DeleteFilesActions
  | GetFileActions
  | ClearFileAction
  | AddFilesAction
  | RemoveFilesAction
  | ClearFilesAction
  | GetAnimationActions
  | UpdateAnimationActions
  | ReplaceAnimationAttachmentActions
  | ClearAnimationsAction
  | GetMediaPropertiesActions
  | ClearMediaPropertiesAction;
