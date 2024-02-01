import { defineFeature, loadFeature } from "jest-cucumber";

import * as actions from "../types";
import { convertToFilesModel } from "../utils";
import reducer, { initState } from "./index";

const feature = loadFeature("./media.feature");

defineFeature(feature, (test) => {
  const file: actions.MediaFilesResponse = {
    file: [
      {
        id: "7343",
        path: "test.jpg",
        fileSize: 8124,
        fileName: "test.jpg",
        extension: "jpg",
        mimeType: "image/jpg",
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
  };
  const id = "testid";
  const media = convertToFilesModel(file)!;
  const expectedState = {
    ...initState,
    uploaded: [...initState.uploaded, { id, media }],
  };

  test("Course element properties reducer", ({ when }) => {
    when("Should handle all api start actions", () => {
      const payload = "media";
      const expectedState2 = { ...initState };
      const types = [actions.UPLOAD_MEDIA_STARTED];

      for (let type of types) {
        expect(
          reducer(initState, {
            type,
            payload,
            error: false,
          } as actions.MediaActions)
        ).toEqual(expectedState2);
      }
    });

    when("Should handle UPLOAD_MEDIA_STARTED action", () => {
      expect(
        reducer(initState, {
          type: actions.UPLOAD_MEDIA_SUCCESS,
          payload: file,
          meta: { id },
          error: false,
        })
      ).toEqual(expectedState);
    });

    when("Should handle REMOVE_UPLOADED_MEDIA action", () => {
      expect(
        reducer(expectedState, {
          type: actions.REMOVE_UPLOADED_MEDIA,
          payload: { id },
        })
      ).toEqual({
        ...initState,
      });
    });

    when("Should handle all api error actions", () => {
      const types = [actions.UPLOAD_MEDIA_ERROR];
      const payload = "error payload";
      const expectedState2 = {
        ...initState,
      };

      for (let type of types) {
        expect(
          reducer(initState, {
            type,
            payload,
            error: true,
          } as actions.MediaActions)
        ).toEqual(expectedState2);
      }
    });
  });
});
