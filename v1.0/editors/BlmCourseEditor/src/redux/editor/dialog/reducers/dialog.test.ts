import { defineFeature, loadFeature } from "jest-cucumber";

import { DialogType } from "editor-constants";
import * as actions from "../types";
import reducer, { initState } from "./index";

const feature = loadFeature("./dialog.feature");

defineFeature(feature, (test) => {
  const options = {
    id: "testuuid",
    title: "title",
    message: "message",
    onOk: () => jest.fn(),
    onCancel: () => jest.fn(),
  };

  test("Dialogs reducer", ({ when }) => {
    when("Should handle OPEN_DIALOG action", () => {
      const dialog = { type: DialogType.Dialog, ...options };

      expect(
        reducer(initState, {
          type: actions.OPEN_DIALOG,
          payload: { dialog },
        })
      ).toEqual({
        ...initState,
        items: [{ ...dialog }],
      });
    });

    when("Should handle OPEN_CONFIRM_DIALOG action", () => {
      const dialog = { type: DialogType.ConfirmDialog, ...options };

      expect(
        reducer(initState, {
          type: actions.OPEN_DIALOG,
          payload: { dialog },
        })
      ).toEqual({
        ...initState,
        items: [{ ...dialog }],
      });
    });

    when("Should hanlde CLOSE_DIALOG action", () => {
      const dialog = { type: DialogType.Dialog, ...options };
      const state = reducer(initState, {
        type: actions.OPEN_DIALOG,
        payload: { dialog },
      });

      expect(state).toEqual({
        ...initState,
        items: [{ ...dialog, id: "testuuid" }],
      });

      expect(
        reducer(state, {
          type: actions.CLOSE_DIALOG,
          payload: { id: "testuuid" },
        })
      ).toEqual({
        ...initState,
      });
    });
  });
});
