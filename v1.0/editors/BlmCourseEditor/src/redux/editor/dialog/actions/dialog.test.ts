import { defineFeature, loadFeature } from "jest-cucumber";

import { DialogType } from "editor-constants";
import * as types from "../types";
import * as actions from "./index";

const feature = loadFeature("./dialog.feature");

defineFeature(feature, (test) => {
  test("Dialog actions", ({ when }) => {
    when("Should create OPEN_DIALOG action", () => {
      const expectedAction = {
        type: types.OPEN_DIALOG,
        payload: {
          dialog: {
            id: "testuuid",
            type: DialogType.Dialog,
            title: "title",
            message: "message",
            onOk: () => jest.fn(),
          },
        },
      };
      expect(actions.openDialog("title", "message", expectedAction.payload.dialog.onOk)).toEqual(
        expectedAction
      );
    });
    when("Should create OPEN_CONFIRM_DIALOG action", () => {
      const expectedAction = {
        type: types.OPEN_CONFIRM_DIALOG,
        payload: {
          dialog: {
            id: "testuuid",
            type: DialogType.ConfirmDialog,
            title: "title",
            message: "message",
            onOk: () => jest.fn(),
            onCancel: () => jest.fn(),
          },
        },
      };
      expect(
        actions.openConfirmDialog(
          "title",
          "message",
          expectedAction.payload.dialog.onOk,
          expectedAction.payload.dialog.onCancel
        )
      ).toEqual(expectedAction);
    });
    when("Should create CLOSE_DIALOG action", () => {
      const expectedAction = {
        type: types.CLOSE_DIALOG,
        payload: { id: "dialogid" },
      };
      expect(actions.closeDialog(expectedAction.payload.id)).toEqual(expectedAction);
    });
  });
});
