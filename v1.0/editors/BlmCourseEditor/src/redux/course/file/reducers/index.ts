import * as actions from "../types";
import {
  createAnimationMedia,
  createMediaFiles,
  updateAnimationAttchement,
  updateAnimationMedia,
} from "../utils";

export const initState: actions.FileState = {
  files: {
    uploaded: {},
    added: [],
    removed: [],
    loaded: {},
  },
  animations: {},
  properties: {},
};

export default function mediaReducer(
  state = initState,
  action: actions.FileActions
): actions.FileState {
  const { files, animations } = state;

  switch (action.type) {
    case actions.UPLOAD_FILE_SUCCESS: {
      const { id, files: replaceables } = action.meta;
      const medias = createMediaFiles(action.payload);
      let loaded = files.loaded;

      if (replaceables) {
        (replaceables as (File | actions.FileContent)[]).forEach((file) => {
          if (!(file instanceof File)) {
            if (file.id && loaded[file.id]) {
              loaded = { ...loaded, [file.id]: file.content };
            }
          }
        });
      }

      if (medias) {
        return {
          ...state,
          files: {
            ...files,
            uploaded: { ...files.uploaded, [id]: medias },
            loaded,
          },
        };
      }

      return state;
    }
    case actions.GET_FILE_SUCCESS: {
      const { id } = action.meta;

      return {
        ...state,
        files: {
          ...files,
          loaded: {
            ...files.loaded,
            [id]: action.payload,
          },
        },
      };
    }
    case actions.CLEAR_FILE: {
      const { [action.payload.id]: deleted, ...others } = files.uploaded;

      return {
        ...state,
        files: {
          ...files,
          uploaded: { ...others },
        },
      };
    }
    case actions.ADD_FILES:
      return {
        ...state,
        files: {
          ...files,
          added: [...files.added, ...action.payload.medias],
        },
      };
    case actions.REMOVE_FILES:
      return {
        ...state,
        files: {
          ...files,
          removed: [...files.removed, ...action.payload.medias],
        },
      };
    case actions.CLEAR_FILES:
      return {
        ...state,
        files: {
          ...files,
          added: [],
          removed: [],
          loaded: {},
        },
      };

    case actions.GET_ANIMATION_SUCCESS: {
      const { id } = action.meta;
      const animation = createAnimationMedia(action.payload);

      return {
        ...state,
        animations: {
          ...animations,
          [id]: animation,
        },
      };
    }
    case actions.UPDATE_ANIMATION_SUCCESS: {
      const { id, animation } = action.meta;
      const media = animations[id];

      if (media) {
        const animation2 = updateAnimationMedia(media, animation);

        if (animation2) {
          return {
            ...state,
            animations: {
              ...animations,
              [id]: animation2,
            },
          };
        }
      }

      return state;
    }
    case actions.REPLACE_ANIMATION_ATTACHMENT_SUCCESS: {
      const { id, attachment } = action.meta;
      const media = animations[id];

      if (media) {
        const animation = updateAnimationAttchement(media, attachment);

        if (animation) {
          return {
            ...state,
            animations: {
              ...animations,
              [id]: animation,
            },
          };
        }
      }

      return state;
    }
    case actions.CLEAR_ANIMATIONS:
      return {
        ...state,
        animations: {},
      };
    case actions.GET_MEDIA_PROPERTIES_SUCCESS: {
      const { id } = action.meta;
      const { wav_json_file } = action.payload[0] || {};

      if (wav_json_file) {
        return {
          ...state,
          properties: { ...state.properties, [id]: { waveform: wav_json_file } },
        };
      }

      return state;
    }
    case actions.CLEAR_MEDIA_PROPERTIES:
      return { ...state, properties: {} };
    default:
      return state;
  }
}
