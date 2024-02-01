import { DialogHandler, DialogOptions } from "types";
import { DialogType } from "editor-constants";
import { createUUID } from "utils";
import * as actions from "../types";

export function openDialog(
  title: string,
  message: string,
  onOk?: DialogHandler,
  options?: DialogOptions
): actions.OpenDialogAction {
  return {
    type: actions.OPEN_DIALOG,
    payload: {
      dialog: {
        id: createUUID(),
        type: DialogType.Dialog,
        title,
        message,
        onOk,
        options,
      },
    },
  };
}

export function openConfirmDialog(
  title: string,
  message: string,
  onOk?: DialogHandler,
  onCancel?: DialogHandler,
  options?: DialogOptions
): actions.OpenConfirmDialogAction {
  return {
    type: actions.OPEN_CONFIRM_DIALOG,
    payload: {
      dialog: {
        id: createUUID(),
        type: DialogType.ConfirmDialog,
        title,
        message,
        onOk,
        onCancel,
        options,
      },
    },
  };
}

export function closeDialog(id: string): actions.CloseDialogAction {
  return {
    type: actions.CLOSE_DIALOG,
    payload: {
      id,
    },
  };
}
