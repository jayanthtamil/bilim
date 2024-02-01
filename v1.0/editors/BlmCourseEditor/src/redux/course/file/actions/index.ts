import { AnimationAttachment, AnimationMedia, MediaFile } from "types";
import { toBRs } from "utils";
import { DOMAIN } from "config";
import { fetchAPI } from "redux/api";
import { ApiThunkAction, AppThunkAction } from "redux/types";
import * as actions from "../types";

export const uploadFiles =
  (id: string, elementId: string, files: (File | actions.FileContent)[]): ApiThunkAction =>
  (dispatch, getState) => {
    const headers = {};
    const state = getState();
    const {
      course: {
        properties: { id: courseId },
      },
    } = state;

    if (!courseId || courseId === "") {
      return;
    }

    const formData = new FormData();

    formData.append("elementId", elementId);
    formData.append("courseId", courseId);

    files.forEach((file) => {
      if (file instanceof File) {
        formData.append("file[]", file, file.name);
      } else {
        if (file.id) {
          formData.append("mediaId[]", file.id);
        }
        formData.append("file[]", new Blob([file.content], { type: "text/plain" }), file.name);
      }
    });

    return dispatch(
      fetchAPI({
        url: "service/upload",
        method: "POST",
        authenticated: false,
        headers,
        body: formData,
        meta: { id, files },
        types: [
          actions.UPLOAD_FILE_STARTED,
          actions.UPLOAD_FILE_SUCCESS,
          actions.UPLOAD_FILE_ERROR,
        ],
      })
    );
  };

export function deleteFiles(elementId: string, medias: MediaFile[]) {
  const body = { element_id: elementId, media_ids: medias.map((media) => media.id) };

  return fetchAPI({
    url: "api/media",
    method: "DELETE",
    authenticated: true,
    body: JSON.stringify(body),
    types: [actions.DELETE_FILES_STARTED, actions.DELETE_FILES_SUCCESS, actions.DELETE_FILES_ERROR],
  });
}

export function getFile(id: string, url: string) {
  return fetchAPI({
    url: DOMAIN + url,
    method: "GET",
    authenticated: false,
    headers: {},
    meta: { id },
    types: [actions.GET_FILE_STARATED, actions.GET_FILE_SUCCESS, actions.GET_FILE_ERROR],
  });
}

export function clearFile(id: string): actions.ClearFileAction {
  return {
    type: actions.CLEAR_FILE,
    payload: {
      id,
    },
  };
}

export function addFiles(medias: MediaFile[]): actions.AddFilesAction {
  return {
    type: actions.ADD_FILES,
    payload: {
      medias,
    },
  };
}

export function removeFiles(medias: MediaFile[]): actions.RemoveFilesAction | undefined {
  if (medias.length) {
    return {
      type: actions.REMOVE_FILES,
      payload: { medias },
    };
  }
}

export function clearFiles(id: string, isSaved: boolean): AppThunkAction<actions.ClearFilesAction> {
  return (dispatch, getState) => {
    const {
      course: {
        file: {
          files: { added, removed },
        },
      },
    } = getState();
    const arr = isSaved ? removed : added;

    if (arr.length > 0) {
      dispatch(deleteFiles(id, arr));
    }

    return dispatch({
      type: actions.CLEAR_FILES,
    });
  };
}

export function getAnimation(id: string) {
  return fetchAPI({
    url: "api/custom_media/" + id,
    method: "GET",
    authenticated: true,
    meta: { id },
    types: [
      actions.GET_ANIMATION_STARATED,
      actions.GET_ANIMATION_SUCCESS,
      actions.GET_ANIMATION_ERROR,
    ],
  });
}

export function updateAnimation(
  id: string,
  animation: Partial<Pick<AnimationMedia, "translations" | "options">>
) {
  const body = {
    ...animation,
    translations: animation.translations?.map((item) => ({ ...item, text: toBRs(item.text) })),
  };

  return fetchAPI({
    url: "api/custom_media/" + id,
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(body),
    meta: { id, animation },
    types: [
      actions.UPDATE_ANIMATION_STARATED,
      actions.UPDATE_ANIMATION_SUCCESS,
      actions.UPDATE_ANIMATION_ERROR,
    ],
  });
}

export function clearAnimations(): actions.ClearAnimationsAction {
  return {
    type: actions.CLEAR_ANIMATIONS,
  };
}

export const replaceAnimationAttachment = (
  id: string,
  attachment: AnimationAttachment,
  file: File
) => {
  const headers = { "Content-Disposition": 'file; filename="' + file.name + '"' };
  const { url } = attachment;

  const formData = new FormData();
  formData.append("id", id);
  formData.append("path", url);
  formData.append("file", file, file.name);

  return fetchAPI({
    url: "service/replace-animation",
    method: "POST",
    authenticated: false,
    headers,
    body: formData,
    meta: { id, attachment },
    types: [
      actions.REPLACE_ANIMATION_ATTACHMENT_STARATED,
      actions.REPLACE_ANIMATION_ATTACHMENT_SUCCESS,
      actions.REPLACE_ANIMATION_ATTACHMENT_ERROR,
    ],
  });
};

export function getMediaProperties(id: string) {
  const body = { media_ids: id };

  return fetchAPI({
    url: "/api/media",
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(body),
    meta: { id },
    types: [
      actions.GET_MEDIA_PROPERTIES_STARATED,
      actions.GET_MEDIA_PROPERTIES_SUCCESS,
      actions.GET_MEDIA_PROPERTIES_ERROR,
    ],
  });
}

export function clearMediaProperties(): actions.ClearMediaPropertiesAction {
  return {
    type: actions.CLEAR_MEDIA_PROPERTIES,
  };
}
